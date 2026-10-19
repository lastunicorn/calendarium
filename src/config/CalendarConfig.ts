import type { WeekStart } from '../core/calendar'
import {
	type HourFormat,
	type Locale,
	LOCALES,
	localeWeekStart,
	type WeekdayFormat,
} from '../core/locale'
import type { Orientation, PaperSize } from '../core/paper'
import type { WeekendHighlight } from '../core/weekend'

// Each set of allowed values is listed once; the type and the validation in `parseConfig`
// derive from the array, and the UI labels are keyed by the type. Sets used by `core/` logic live
// there: locales in `core/locale.ts`, paper sizes and orientations in `core/paper.ts`, weekend
// highlights in `core/weekend.ts`.

/** Ids of the page layouts; each maps to a component in `ui/layouts/registry.ts`. */
export const LAYOUT_IDS = ['year-per-page', 'month-per-page', 'day-per-page'] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

/** What fills a `day-per-page` page under its header: an hourly schedule or plain ruled lines. */
export const DAY_PAGE_LINES = ['hours', 'ruled'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

export const MARGIN_SIDES = ['top', 'right', 'bottom', 'left'] as const
export type MarginSide = (typeof MARGIN_SIDES)[number]

/** Blank space between the paper edge and the calendar, in mm. */
export type Margins = Record<MarginSide, number>

/**
 * The first full year of the Gregorian calendar, which the printed weekdays and leap days follow.
 * It also keeps years 0–99 out: `new Date(year, …)` reads them as 1900–1999.
 */
export const MIN_YEAR = 1583
export const MAX_YEAR = 9999
export const MAX_MARGIN = 50
export const MIN_HOUR = 0
export const MAX_HOUR = 23

export function isYear(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_YEAR && (value as number) <= MAX_YEAR
}

/** A whole hour of the day, 0–23. */
export function isHour(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_HOUR && (value as number) <= MAX_HOUR
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

/** Options every layout has. */
export interface CommonConfig {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	weekStart: WeekStart
	weekdayFormat: WeekdayFormat
	highlightWeekends: WeekendHighlight
	/** ISO week numbers in a column before each week. */
	showWeekNumbers: boolean
	page: PageSetup
}

export interface YearPerPageConfig extends CommonConfig {
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
}

export type MonthPerPageConfig = CommonConfig

export interface DayPerPageConfig extends CommonConfig {
	/** What fills the page under its header. */
	dayPageLines: DayPageLines
	/** Clock of the hour labels on the schedule. */
	hourFormat: HourFormat
	/** First and last rows of the schedule, as hours 0–23; both rows are shown. */
	firstHour: number
	lastHour: number
}

/** Each layout's own options. Keyed by every `LayoutId` (checked below). */
export interface LayoutConfigs {
	'year-per-page': YearPerPageConfig
	'month-per-page': MonthPerPageConfig
	'day-per-page': DayPerPageConfig
}

// Compile-time checks: `LayoutConfigs` has exactly the layout ids, each extending `CommonConfig`.
type Assert<T extends true> = T
export type LayoutConfigsCheck = Assert<
	[keyof LayoutConfigs] extends [LayoutId]
		? [LayoutId] extends [keyof LayoutConfigs]
			? LayoutConfigs extends Record<LayoutId, CommonConfig>
				? true
				: false
			: false
		: false
>

/** The options of any one layout. */
export type LayoutConfig = LayoutConfigs[LayoutId]

/** The app's whole config: which layout is shown, and a remembered set of options per layout. */
export interface AppConfig {
	/** The active layout, whose options the sidebar edits and the preview shows. */
	layout: LayoutId
	layouts: LayoutConfigs
}

/**
 * The browser's language when the calendar has it, so a German browser starts in German.
 * English, of any region, and unsupported languages start in British English.
 */
function defaultLocale(): Locale {
	const language = globalThis.navigator?.language.slice(0, 2)
	if (language === undefined || language === 'en') return 'en-GB'
	return LOCALES.find((locale) => locale.startsWith(language)) ?? 'en-GB'
}

function margins(mm: number): Margins {
	return { top: mm, right: mm, bottom: mm, left: mm }
}

/** The options shared by every layout, with the values all layouts start from. */
function commonDefaults(): CommonConfig {
	const locale = defaultLocale()
	return {
		year: new Date().getFullYear(),
		locale,
		// The language's own first day (Sunday in en-US), or Monday when the browser can't tell.
		weekStart: localeWeekStart(locale) ?? 1,
		weekdayFormat: 'narrow',
		highlightWeekends: 'days',
		showWeekNumbers: false,
		page: { paperSize: 'a4', orientation: 'portrait', margins: margins(12) },
	}
}

/** Each layout's defaults, picked for how it is drawn. */
export const DEFAULTS: { [K in LayoutId]: () => LayoutConfigs[K] } = {
	// 12 small months fit portrait; one-letter weekdays keep them narrow.
	'year-per-page': () => ({ ...commonDefaults(), title: '', subtitle: '' }),
	// Large writing cells fit landscape, with room for three-letter weekdays.
	'month-per-page': () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			highlightWeekends: 'columns',
			showWeekNumbers: true,
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	// A tall schedule fits portrait; week numbers show as "Week N" in the heading.
	'day-per-page': () => ({
		...commonDefaults(),
		showWeekNumbers: true,
		dayPageLines: 'hours',
		hourFormat: 'auto',
		firstHour: 7,
		lastHour: 21,
	}),
}

export function defaultAppConfig(): AppConfig {
	return {
		layout: 'year-per-page',
		layouts: {
			'year-per-page': DEFAULTS['year-per-page'](),
			'month-per-page': DEFAULTS['month-per-page'](),
			'day-per-page': DEFAULTS['day-per-page'](),
		},
	}
}
