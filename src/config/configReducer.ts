import type { AppConfig, LayoutConfigs, LayoutId } from './CalendarConfig'
import { defaultLayoutConfig, normalizeLayout } from './layouts'

/**
 * The commands that change the `AppConfig` aggregate, the only way it changes. The per-layout ones
 * have one variant per layout, so a patch or config has that layout's type.
 */
export type ConfigAction =
	/** Shows another layout; every layout's options stay as they were. */
	| { type: 'selectLayout'; layout: LayoutId }
	/** Changes some of one layout's options, keeping the rest. */
	| { [K in LayoutId]: { type: 'update'; layout: K; patch: Partial<LayoutConfigs[K]> } }[LayoutId]
	/** Restores one layout's default options; the active layout stays as it was. */
	| { type: 'resetLayout'; layout: LayoutId }
	/** Swaps in one layout's options and shows that layout (an imported file). */
	| { [K in LayoutId]: { type: 'importLayout'; layout: K; config: LayoutConfigs[K] } }[LayoutId]

/** `config` with `layout`'s options replaced, after applying that layout's rules. */
function withLayout<K extends LayoutId>(
	config: AppConfig,
	layout: K,
	options: LayoutConfigs[K],
): AppConfig {
	return { ...config, layouts: { ...config.layouts, [layout]: normalizeLayout(layout, options) } }
}

/** `config` after `action`, each changed layout's options passed through its `normalize`. */
export function configReducer(config: AppConfig, action: ConfigAction): AppConfig {
	switch (action.type) {
		case 'selectLayout':
			return { ...config, layout: action.layout }
		case 'update':
			return withLayout(config, action.layout, {
				...config.layouts[action.layout],
				...action.patch,
			})
		case 'resetLayout':
			return withLayout(config, action.layout, defaultLayoutConfig(action.layout))
		case 'importLayout':
			return { ...withLayout(config, action.layout, action.config), layout: action.layout }
	}
}
