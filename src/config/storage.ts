import { isWeekStart } from '../core/calendar'
import {
	type CalendarConfig,
	defaultConfig,
	isMargin,
	LOCALES,
	MARGIN_SIDES,
} from './CalendarConfig'

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

	if (isWeekStart(stored.weekStart)) config.weekStart = stored.weekStart

	if (stored.weekdayFormat === 'short' || stored.weekdayFormat === 'narrow')
		config.weekdayFormat = stored.weekdayFormat

	if (typeof stored.title === 'string') config.title = stored.title

	if (typeof stored.subtitle === 'string') config.subtitle = stored.subtitle

	if (
		stored.highlightWeekends === 'off' ||
		stored.highlightWeekends === 'days' ||
		stored.highlightWeekends === 'columns'
	)
		config.highlightWeekends = stored.highlightWeekends

	if (typeof stored.showWeekNumbers === 'boolean') config.showWeekNumbers = stored.showWeekNumbers

	if (stored.paperSize === 'a4' || stored.paperSize === 'a3' || stored.paperSize === 'letter')
		config.paperSize = stored.paperSize

	if (stored.orientation === 'portrait' || stored.orientation === 'landscape')
		config.orientation = stored.orientation

	if (typeof stored.margins === 'object' && stored.margins !== null) {
		const margins = stored.margins as Record<string, unknown>
		for (const side of MARGIN_SIDES) {
			if (isMargin(margins[side])) config.margins[side] = margins[side]
		}
	}

	return config
}

/** Pretty-printed JSON for a downloadable config file. */
export function serializeConfig(config: CalendarConfig): string {
	return JSON.stringify(config, null, '\t') + '\n'
}

/** Parses an imported config file; `null` when it is not a JSON object. */
export function parseConfigFile(text: string): CalendarConfig | null {
	try {
		const data: unknown = JSON.parse(text)
		if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
		return parseConfig(data)
	} catch {
		return null
	}
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
