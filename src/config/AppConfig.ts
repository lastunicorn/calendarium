import { defaultLayoutConfig, type LayoutConfigs, type LayoutId, mapLayouts } from '../layouts'

/**
 * The app's whole config: which layout is shown, and a remembered set of options per layout.
 * The aggregate root of the settings: changed only by `configReducer`'s commands, which keep every
 * layout's options normalized, and loaded and saved by `storage.ts`, its repository.
 */
export interface AppConfig {
	/** The active layout, whose options the sidebar edits and the preview shows. */
	layout: LayoutId
	layouts: LayoutConfigs
}

export function defaultAppConfig(): AppConfig {
	return { layout: 'year-per-page', layouts: mapLayouts(defaultLayoutConfig) }
}
