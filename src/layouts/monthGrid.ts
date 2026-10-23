import type { CalendarMonth } from '../core/calendar'
import type { WeekdayFormat } from '../core/locale'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../core/weekend'
import { isBoolean, oneOf, type Validators } from '../core/validation'

/**
 * The weekday formats a month grid's columns have room for: not `full`, except on a page of its
 * own (`month-per-page`, whose validator allows it). The field keeps the `WeekdayFormat` type, as
 * `weekdayFormat` has one type in every layout.
 */
export const MONTH_GRID_WEEKDAY_FORMATS = ['short', 'narrow'] as const satisfies WeekdayFormat[]

/** The options of a month drawn as a grid of weeks, shared by the layouts that draw one. */
export interface MonthGridOptions {
	/** How the weekday names above the columns are abbreviated, one of `MONTH_GRID_WEEKDAY_FORMATS`. */
	weekdayFormat: WeekdayFormat
	highlightWeekends: WeekendHighlight
	/** ISO week numbers in a column before each week. */
	showWeekNumbers: boolean
}

/** The default grid: one-letter weekdays, the month's own weekend days highlighted. */
export function monthGridDefaults(): MonthGridOptions {
	return {
		weekdayFormat: 'narrow',
		highlightWeekends: 'days',
		showWeekNumbers: false,
	}
}

export const MONTH_GRID_VALIDATORS: Validators<MonthGridOptions> = {
	weekdayFormat: oneOf(MONTH_GRID_WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}

/** How large a mini month is drawn in its corner of a page, its box and its text together. */
export const MINI_MONTH_SIZES = ['small', 'medium', 'large', 'extraLarge'] as const
export type MiniMonthSize = (typeof MINI_MONTH_SIZES)[number]

/** A month drawn small beside a page's main content, for context; it can be left out. */
export interface MiniMonthOptions extends MonthGridOptions {
	show: boolean
	/** Whether the title above the grid names the year after the month, or the month alone. */
	showYear: boolean
	size: MiniMonthSize
}

/** The default mini month: shown, medium, titled with its month alone, with week numbers. */
export function miniMonthDefaults(): MiniMonthOptions {
	return {
		show: true,
		showYear: false,
		size: 'medium',
		...monthGridDefaults(),
		showWeekNumbers: true,
	}
}

export const MINI_MONTH_VALIDATORS: Validators<MiniMonthOptions> = {
	show: isBoolean,
	showYear: isBoolean,
	size: oneOf(MINI_MONTH_SIZES),
	...MONTH_GRID_VALIDATORS,
}

/** A month grid drawn small, as a page plans it: the props of the `MiniMonth` that draws it. */
export interface MiniMonthPlan {
	month: CalendarMonth
	/** The month's name, above the grid. */
	name: string
	/** Weekday labels, ordered from the week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	/** The size of a mini month in a page's corner; left out for a month grid drawn full size. */
	size?: MiniMonthSize
	/** Day of the month to mark, e.g. the day a page is about. */
	markedDay?: number
	/** Key of any day of the week to mark as a row, e.g. the week a page is about. */
	markedWeek?: string
	/** Days of the month that have an event, each circled. */
	eventDays?: number[]
}
