import { type AppConfig, defaultAppConfig } from './CalendarConfig'
import { parseConfig, toStoredConfig } from './parseConfig'

const STORAGE_KEY = 'calendarium-config'

export function loadConfig(): AppConfig {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)

		const obj = raw === null ? null : JSON.parse(raw)

		return parseConfig(obj)
	} catch {
		return defaultAppConfig()
	}
}

export function saveConfig(config: AppConfig): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toStoredConfig(config)))
	} catch {
		// Storage may be unavailable (private mode, quota); the app still works without it.
	}
}
