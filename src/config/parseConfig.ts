import { ORIENTATIONS, PAPER_SIZES } from '../core/paper'
import {
	type AppConfig,
	isMargin,
	LAYOUT_IDS,
	type LayoutConfigs,
	type LayoutId,
	MARGIN_SIDES,
	type PageSetup,
} from './CalendarConfig'
import { defaultAppConfig, layoutSpec, mapLayouts } from './layouts'
import { asObject, type StoredData, upgradeStorage } from './migrations'
import { isBoolean, oneOf, type Validators } from './validators'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** The app config as written to storage: tagged with its config version and the app version. */
export function toStoredConfig(config: AppConfig) {
	return { version: CONFIG_VERSION, app: APP_VERSION, ...config }
}

/** Margins are validated per side instead, so one bad side keeps the others. */
const PAGE_VALIDATORS: Validators<PageSetup, Exclude<keyof PageSetup, 'margins'>> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
	mirrorMargins: isBoolean,
}

const isLayoutId = oneOf(LAYOUT_IDS)

/**
 * Copies each field of `source` that passes its validator onto `target`. A field that is present
 * but invalid is added to `ignored`, as `prefix` + its name.
 */
function copyValid<T, K extends keyof T>(
	target: T,
	source: StoredData,
	validators: Validators<T, K>,
	ignored: string[],
	prefix = '',
) {
	for (const key of Object.keys(validators) as K[]) {
		const value = source[key as string]
		if (validators[key](value)) target[key] = value
		else if (value !== undefined) ignored.push(prefix + String(key))
	}
}

/** Copies the valid fields of stored page data onto `target`, adding the invalid ones to `ignored`. */
function copyValidPage(target: PageSetup, data: unknown, ignored: string[]) {
	if (data === undefined) return
	const page = asObject(data)
	if (page === null) {
		ignored.push('page')
		return
	}
	copyValid(target, page, PAGE_VALIDATORS, ignored, 'page.')
	if (page.margins === undefined) return
	const margins = asObject(page.margins)
	if (margins === null) {
		ignored.push('page.margins')
		return
	}
	for (const side of MARGIN_SIDES) {
		const value = margins[side]
		if (isMargin(value)) target.margins[side] = value
		else if (value !== undefined) ignored.push(`page.margins.${side}`)
	}
}

/**
 * Keeps only the valid fields of one layout's options, falling back to that layout's defaults,
 * then applies the layout's cross-field rules. Invalid fields are added to `ignored`.
 */
function parseCurrentLayoutConfig<K extends LayoutId>(
	layout: K,
	data: unknown,
	ignored: string[] = [],
): LayoutConfigs[K] {
	const spec = layoutSpec(layout)
	const config = spec.defaults()
	const stored = asObject(data)
	if (stored === null) return config
	copyValid(config, stored, spec.validators, ignored)
	copyValidPage(config.page, stored.page, ignored)
	return spec.normalize(config)
}

/** One layout's options parsed from untrusted data, with the fields that were dropped. */
export interface ParsedLayoutConfig<K extends LayoutId> {
	config: LayoutConfigs[K]
	/**
	 * Fields that were present but invalid, and kept their defaults: `firstHour`,
	 * `page.margins.top`. Fields the layout doesn't have are left out silently.
	 */
	ignored: string[]
}

/**
 * Keeps only the valid fields of untrusted flat data in the current file shape (an imported
 * file, after `upgradeFile`) for one layout.
 */
export function parseLayoutConfig<K extends LayoutId>(
	layout: K,
	data: unknown,
): ParsedLayoutConfig<K> {
	const ignored: string[] = []
	const config = parseCurrentLayoutConfig(layout, data, ignored)
	return { config, ignored }
}

/** The layout named by flat data in the current file shape; `null` when it names none. */
export function parseLayoutId(data: StoredData): LayoutId | null {
	return isLayoutId(data.layout) ? data.layout : null
}

/**
 * Keeps only valid fields from untrusted stored data of any version, falling back to defaults.
 * Data from a later version is read as the current shape, as far as it matches; data without a
 * valid version is not read at all.
 */
export function parseConfig(data: unknown): AppConfig {
	const config = defaultAppConfig()
	const raw = asObject(data)
	const stored = raw === null ? null : upgradeStorage(raw)
	if (stored === null) return config

	if (isLayoutId(stored.layout)) config.layout = stored.layout
	const layouts = asObject(stored.layouts) ?? {}
	config.layouts = mapLayouts((layout) => parseCurrentLayoutConfig(layout, layouts[layout]))
	return config
}
