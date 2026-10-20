import { type AppConfig, defaultAppConfig } from './AppConfig'
import { LAYOUT_IDS, type LayoutConfigs, type LayoutId, layoutSpec, mapLayouts } from '../layouts'
import { asObject, type StoredData, upgradeStorage } from './migrations'
import { oneOf, type Validator } from '../core/validation'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** The app config as written to storage: tagged with its config version and the app version. */
export function toStoredConfig(config: AppConfig) {
	return { version: CONFIG_VERSION, app: APP_VERSION, ...config }
}

/** A validator table seen field by field, whatever object it checks. */
type AnyValidators = { [field: string]: Validator<unknown> | AnyValidators }

const isLayoutId = oneOf(LAYOUT_IDS)

/**
 * Copies each field of `source` that passes its validator onto `target`. A nested table checks an
 * object field by field, copying onto the object `target` already holds there. A field that is
 * present but invalid, or a nested object that is not an object, is added to `ignored` as its path:
 * `prefix` + its name (`page.margins.top`).
 */
function copyValid(
	target: object,
	source: StoredData,
	validators: AnyValidators,
	ignored: string[],
	prefix = '',
) {
	const fields = target as StoredData
	for (const [key, check] of Object.entries(validators)) {
		const value = source[key]
		const path = prefix + key
		if (typeof check === 'function') {
			if (check(value)) fields[key] = value
			else if (value !== undefined) ignored.push(path)
			continue
		}
		if (value === undefined) continue
		const nested = asObject(value)
		if (nested === null) ignored.push(path)
		else copyValid(fields[key] as object, nested, check, ignored, `${path}.`)
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
