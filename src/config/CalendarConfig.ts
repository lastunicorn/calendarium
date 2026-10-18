import type { WeekStart } from '../core/calendar'
import type { WeekdayFormat } from '../core/locale'

// Each set of allowed values is listed once; the type and the validation in `parseConfig`
// derive from the array, and the UI labels are keyed by the type.

export const ORIENTATIONS = ['portrait', 'landscape'] as const
export type Orientation = (typeof ORIENTATIONS)[number]

export const PAPER_SIZES = ['a4', 'a3', 'letter'] as const
export type PaperSize = (typeof PAPER_SIZES)[number]

/** `days` highlights only weekend cells with a day number; `columns` the whole weekend column. */
export const WEEKEND_HIGHLIGHTS = ['off', 'days', 'columns'] as const
export type WeekendHighlight = (typeof WEEKEND_HIGHLIGHTS)[number]

/** BCP 47 tags of the languages month and weekday names can be shown in. */
export const LOCALES = ['en-US', 'ro-RO', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'ja-JP'] as const
export type Locale = (typeof LOCALES)[number]

export const MARGIN_SIDES = ['top', 'right', 'bottom', 'left'] as const
export type MarginSide = (typeof MARGIN_SIDES)[number]

/** Blank space between the paper edge and the calendar, in mm. */
export type Margins = Record<MarginSide, number>

export const MIN_YEAR = 1
export const MAX_YEAR = 9999
export const MAX_MARGIN = 50

export function isYear(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_YEAR && (value as number) <= MAX_YEAR
}

export function isMargin(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_MARGIN
}

export interface CalendarConfig {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	weekStart: WeekStart
	weekdayFormat: WeekdayFormat
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
	highlightWeekends: WeekendHighlight
	/** ISO week numbers in a column before each week. */
	showWeekNumbers: boolean
	paperSize: PaperSize
	orientation: Orientation
	margins: Margins
}

function defaultLocale(): Locale {
	const language = globalThis.navigator?.language.slice(0, 2)
	return LOCALES.find((locale) => locale.startsWith(language)) ?? 'en-US'
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
		paperSize: 'a4',
		orientation: 'portrait',
		margins: { top: 10, right: 10, bottom: 10, left: 10 },
	}
}
