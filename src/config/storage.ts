import { type CalendarConfig, defaultConfig } from './CalendarConfig'
import { parseConfig, toStoredConfig } from './parseConfig'

const STORAGE_KEY = 'calendar-config'

export function loadConfig(): CalendarConfig {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)

		const obj = raw === null ? null : JSON.parse(raw)

		return parseConfig(obj)
	} catch {
		return defaultConfig()
	}
}

export function saveConfig(config: CalendarConfig): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toStoredConfig(config)))
	} catch {
		// Storage may be unavailable (private mode, quota); the app still works without it.
	}
}
