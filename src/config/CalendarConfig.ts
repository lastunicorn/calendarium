import type { WeekStart } from '../core/calendar'

export interface CalendarConfig {
	year: number
	/** BCP 47 tag used for month and weekday names, e.g. `en-US`, `ro-RO`. */
	locale: string
	weekStart: WeekStart
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	highlightWeekends: boolean
}

export const LOCALES = [
	{ value: 'en-US', label: 'English' },
	{ value: 'ro-RO', label: 'Română' },
	{ value: 'de-DE', label: 'Deutsch' },
	{ value: 'fr-FR', label: 'Français' },
	{ value: 'es-ES', label: 'Español' },
	{ value: 'it-IT', label: 'Italiano' },
]

function defaultLocale(): string {
	const language = globalThis.navigator?.language.slice(0, 2)
	return LOCALES.find((x) => x.value.startsWith(language))?.value ?? 'en-US'
}

export function defaultConfig(): CalendarConfig {
	return {
		year: new Date().getFullYear(),
		locale: defaultLocale(),
		weekStart: 1,
		title: '',
		highlightWeekends: true,
	}
}
