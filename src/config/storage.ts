import { type CalendarConfig, defaultConfig, LOCALES } from './CalendarConfig'

const STORAGE_KEY = 'calendar-config'

/** Keeps only valid fields from untrusted stored data, falling back to defaults. */
export function parseConfig(data: unknown): CalendarConfig {
	const config = defaultConfig()
	if (typeof data !== 'object' || data === null) return config
	const stored = data as Record<string, unknown>

	if (
		Number.isInteger(stored.year) &&
		(stored.year as number) >= 1 &&
		(stored.year as number) <= 9999
	)
		config.year = stored.year as number

	if (LOCALES.some((locale) => locale.value === stored.locale))
		config.locale = stored.locale as string

	if (stored.weekStart === 0 || stored.weekStart === 1) config.weekStart = stored.weekStart

	if (typeof stored.title === 'string') config.title = stored.title

	if (typeof stored.highlightWeekends === 'boolean')
		config.highlightWeekends = stored.highlightWeekends

	if (stored.orientation === 'portrait' || stored.orientation === 'landscape')
		config.orientation = stored.orientation

	return config
}

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
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
	} catch {
		// Storage may be unavailable (private mode, quota); the app still works without it.
	}
}
