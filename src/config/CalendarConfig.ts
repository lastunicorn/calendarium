import type { WeekStart } from '../core/calendar'
import type { HourFormat, WeekdayFormat } from '../core/locale'
import type { Orientation, PaperSize } from '../core/paper'
import type { WeekendHighlight } from '../core/weekend'

// Each set of allowed values is listed once; the type and the validation in `parseConfig`
// derive from the array, and the UI labels are keyed by the type. Sets used by `core/` logic live
// there: paper sizes and orientations in `core/paper.ts`, weekend highlights in `core/weekend.ts`.

/** Ids of the page layouts; each maps to a component in `ui/layouts/registry.ts`. */
export const LAYOUT_IDS = ['year-one-page', 'month-per-page', 'day-per-page'] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

/** What fills a `day-per-page` page under its header: an hourly schedule or plain ruled lines. */
export const DAY_PAGE_LINES = ['hours', 'ruled'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

/** BCP 47 tags of the languages month and weekday names can be shown in. */
export const LOCALES = ['en-US', 'en-UK', 'ro-RO', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'ja-JP'] as const
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

/** The sheet the calendar is printed on. */
export interface PageSetup {
	paperSize: PaperSize
	orientation: Orientation
	margins: Margins
}

export interface CalendarConfig {
	layout: LayoutId
	/** Only used by the `day-per-page` layout. */
	dayPageLines: DayPageLines
	/** Clock of the hour labels on `day-per-page` schedules. */
	hourFormat: HourFormat
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
	page: PageSetup
}

function defaultLocale(): Locale {
	const language = globalThis.navigator?.language.slice(0, 2)
	return LOCALES.find((locale) => locale.startsWith(language)) ?? 'en-US'
}

export function defaultConfig(): CalendarConfig {
	return {
		layout: 'year-one-page',
		dayPageLines: 'hours',
		hourFormat: 'auto',
		year: new Date().getFullYear(),
		locale: defaultLocale(),
		weekStart: 1,
		weekdayFormat: 'narrow',
		title: '',
		subtitle: '',
		highlightWeekends: 'days',
		showWeekNumbers: false,
		page: {
			paperSize: 'a4',
			orientation: 'portrait',
			margins: {
				top: 12,
				right: 12,
				bottom: 12,
				left: 12,
			},
		},
	}
}
