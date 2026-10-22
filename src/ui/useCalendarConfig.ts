import { useEffect, useReducer, useRef } from 'react'
import type { LayoutOptions, LayoutId } from '../layouts'
import type { ImportedLayoutOptions } from '../config/configFile'
import { type ConfigAction, configReducer } from '../config/configReducer'
import { loadConfig, saveConfig } from '../config/storage'

/** Changes some of one layout's options. */
export type UpdateLayoutOptions = <K extends LayoutId>(
	layout: K,
	patch: Partial<LayoutOptions[K]>,
) => void

/** The app's single config state: loaded from and saved to `localStorage`. */
export function useCalendarConfig() {
	const [config, dispatch] = useReducer(configReducer, undefined, loadConfig)
	// Saved only after a change, not on mount: the loaded config is already stored, and writing
	// it back would drop the fields a newer version stored that this one doesn't know.
	const saved = useRef(config)

	useEffect(() => {
		if (config === saved.current) return
		saved.current = config
		saveConfig(config)
	}, [config])

	function selectLayout(layout: LayoutId) {
		dispatch({ type: 'selectLayout', layout })
	}

	// The casts pair `layout` with its options, which TypeScript can't follow through a generic.
	const update: UpdateLayoutOptions = (layout, patch) => {
		dispatch({ type: 'update', layout, patch } as ConfigAction)
	}

	function resetLayout(layout: LayoutId) {
		dispatch({ type: 'resetLayout', layout })
	}

	function importLayout({ layout, options }: ImportedLayoutOptions) {
		dispatch({ type: 'importLayout', layout, options } as ConfigAction)
	}

	return { config, selectLayout, update, resetLayout, importLayout }
}
