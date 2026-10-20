import type { AppConfig } from './CalendarConfig'
import { defaultAppConfig } from './layouts'
import { asObject, isFromLaterVersion } from './migrations'
import { parseConfig, toStoredConfig } from './parseConfig'

const STORAGE_KEY = 'calendarium-config'

/** Keeps data written by a later version before this one first overwrites it. */
const BACKUP_KEY = 'calendarium-config-backup'

/**
 * The `AppConfig` repository: one config per browser, under one key. Loads it, falling back to
 * the defaults when there is none or storage is unavailable.
 */
export function loadConfig(): AppConfig {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)

		const obj = raw === null ? null : JSON.parse(raw)

		return parseConfig(obj)
	} catch {
		return defaultAppConfig()
	}
}

/** Whether stored text holds data from a later version, with fields this one may not know. */
function isFromLater(raw: string | null): boolean {
	if (raw === null) return false
	try {
		const data = asObject(JSON.parse(raw))
		return data !== null && isFromLaterVersion(data)
	} catch {
		return false
	}
}

/**
 * Saves the config. Data written by a later version (after a rollback, or two deployed versions
 * open at once) is copied to a backup key first, since this version would drop what it doesn't
 * know.
 */
export function saveConfig(config: AppConfig): void {
	try {
		const previous = localStorage.getItem(STORAGE_KEY)
		if (isFromLater(previous)) localStorage.setItem(BACKUP_KEY, previous as string)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toStoredConfig(config)))
	} catch {
		// Storage may be unavailable (private mode, quota); the app still works without it.
	}
}
