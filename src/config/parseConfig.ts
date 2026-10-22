import { type AppConfig, defaultAppConfig } from './AppConfig'
import { isLayoutId, type LayoutConfigs, type LayoutId, layoutSpec, mapLayouts } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { type StoredData, upgradeStorage } from './migrations'
import { asObject } from '../core/validation'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** The app config as written to storage: tagged with its config version and the app version. */
export function toStoredConfig(config: AppConfig) {
	return { version: CONFIG_VERSION, app: APP_VERSION, ...config }
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
	return parseOptions(layoutSpec(layout), data, ignored)
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
