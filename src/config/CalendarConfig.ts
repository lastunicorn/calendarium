import type { WeekStart } from '../core/calendar'
import type { WeekdayFormat } from '../core/locale'

export type Orientation = 'portrait' | 'landscape'

/** `days` highlights only weekend cells with a day number; `columns` the whole weekend column. */
export type WeekendHighlight = 'off' | 'days' | 'columns'

export interface CalendarConfig {
	year: number
	/** BCP 47 tag used for month and weekday names, e.g. `en-US`, `ro-RO`. */
	locale: string
	weekStart: WeekStart
	weekdayFormat: WeekdayFormat
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
	highlightWeekends: WeekendHighlight
	/** ISO week numbers in a column before each week. */
	showWeekNumbers: boolean
	orientation: Orientation
}

export const LOCALES = [
	{ value: 'en-US', label: 'English' },
	{ value: 'ro-RO', label: 'Română' },
	{ value: 'de-DE', label: 'Deutsch' },
	{ value: 'fr-FR', label: 'Français' },
	{ value: 'es-ES', label: 'Español' },
	{ value: 'it-IT', label: 'Italiano' },
	{ value: 'ja-JP', label: '日本語' },
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
		weekdayFormat: 'narrow',
		title: '',
		subtitle: '',
		highlightWeekends: 'columns',
		showWeekNumbers: false,
		orientation: 'portrait',
	}
}
