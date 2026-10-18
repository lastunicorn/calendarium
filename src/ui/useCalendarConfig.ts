import { useEffect, useReducer } from 'react'
import { DEFAULTS, type LayoutConfigs, type LayoutId } from '../config/CalendarConfig'
import type { ImportedLayoutConfig } from '../config/configFile'
import { type ConfigAction, configReducer } from '../config/configReducer'
import { loadConfig, saveConfig } from '../config/storage'

/** Changes some of one layout's options. */
export type UpdateLayoutConfig = <K extends LayoutId>(
	layout: K,
	patch: Partial<LayoutConfigs[K]>,
) => void

/** The app's single config state: loaded from and saved to `localStorage`. */
export function useCalendarConfig() {
	const [config, dispatch] = useReducer(configReducer, undefined, loadConfig)

	useEffect(() => {
		saveConfig(config)
	}, [config])

	function selectLayout(layout: LayoutId) {
		dispatch({ type: 'selectLayout', layout })
	}

	// The casts pair `layout` with its options, which TypeScript can't follow through a generic.
	const update: UpdateLayoutConfig = (layout, patch) => {
		dispatch({ type: 'update', layout, patch } as ConfigAction)
	}

	function resetLayout(layout: LayoutId) {
		dispatch({ type: 'replaceLayout', layout, config: DEFAULTS[layout]() } as ConfigAction)
	}

	function importLayout({ layout, config }: ImportedLayoutConfig) {
		dispatch({ type: 'importLayout', layout, config } as ConfigAction)
	}

	return { config, selectLayout, update, resetLayout, importLayout }
}
