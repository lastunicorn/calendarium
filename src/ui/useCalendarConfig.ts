import { useEffect, useReducer } from 'react'
import type { CalendarConfig } from '../config/CalendarConfig'
import { configReducer } from '../config/configReducer'
import { loadConfig, saveConfig } from '../config/storage'

/** The app's single config state: loaded from and saved to `localStorage`. */
export function useCalendarConfig() {
	const [config, dispatch] = useReducer(configReducer, undefined, loadConfig)

	useEffect(() => {
		saveConfig(config)
	}, [config])

	function update(patch: Partial<CalendarConfig>) {
		dispatch({ type: 'update', patch })
	}

	function replace(next: CalendarConfig) {
		dispatch({ type: 'replace', config: next })
	}

	return { config, update, replace }
}
