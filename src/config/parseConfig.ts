import { HOUR_FORMATS, isWeekStartSetting, LOCALES, WEEKDAY_FORMATS } from '../core/locale'
import { ORIENTATIONS, PAPER_SIZES } from '../core/paper'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'
import {
	type AppConfig,
	type CommonConfig,
	DAY_PAGE_LINES,
	DEFAULTS,
	defaultAppConfig,
	isHour,
	isMargin,
	isYear,
	LAYOUT_IDS,
	type LayoutConfigs,
	type LayoutId,
	MARGIN_SIDES,
	type PageSetup,
} from './CalendarConfig'
import { asObject, type StoredData, upgradeStorage } from './migrations'
import { normalizeLayout } from './normalize'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** The app config as written to storage: tagged with its config version and the app version. */
export function toStoredConfig(config: AppConfig) {
	return { version: CONFIG_VERSION, app: APP_VERSION, ...config }
}

function oneOf<T>(values: readonly T[]) {
	return (value: unknown): value is T => values.includes(value as T)
}

function isString(value: unknown): value is string {
	return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean'
}

type Validator<T> = (value: unknown) => value is T

/** One validator per listed field of `T`. As a mapped type, a missing one is a compile error. */
type Validators<T, K extends keyof T> = { [P in K]: Validator<T[P]> }

/** `page` is an object, validated by its own fields below. */
const COMMON_VALIDATORS: Validators<CommonConfig, Exclude<keyof CommonConfig, 'page'>> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStartSetting,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}

/** Each layout's validators: the common ones plus its own fields. */
const LAYOUT_VALIDATORS: {
	[K in LayoutId]: Validators<LayoutConfigs[K], Exclude<keyof LayoutConfigs[K], 'page'>>
} = {
	'year-per-page': {
		...COMMON_VALIDATORS,
		title: isString,
		subtitle: isString,
	},
	'month-per-page': COMMON_VALIDATORS,
	'day-per-page': {
		...COMMON_VALIDATORS,
		dayPageLines: oneOf(DAY_PAGE_LINES),
		hourFormat: oneOf(HOUR_FORMATS),
		firstHour: isHour,
		lastHour: isHour,
	},
}

/** Margins are validated per side instead, so one bad side keeps the others. */
const PAGE_VALIDATORS: Validators<PageSetup, Exclude<keyof PageSetup, 'margins'>> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
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
	const config = DEFAULTS[layout]()
	const stored = asObject(data)
	if (stored === null) return config
	copyValid(config, stored, LAYOUT_VALIDATORS[layout], ignored)
	copyValidPage(config.page, stored.page, ignored)
	return normalizeLayout(layout, config)
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
	config.layouts = {
		'year-per-page': parseCurrentLayoutConfig('year-per-page', layouts['year-per-page']),
		'month-per-page': parseCurrentLayoutConfig('month-per-page', layouts['month-per-page']),
		'day-per-page': parseCurrentLayoutConfig('day-per-page', layouts['day-per-page']),
	}
	return config
}
