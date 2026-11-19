import { buildMonth, type CalendarMonth } from '../core/calendar'
import { eventNames, type CalendarEvent } from '../core/events'
import { monthYearName, weekdayNames, type WeekdayFormat } from '../core/locale'
import { isBoolean, oneOf, type Validators } from '../core/validation'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../core/weekend'
import type { CalendarModel } from './common'

/**
 * The weekday formats a month grid's columns have room for: not `full`, except on a page of its
 * own (`monthly`, whose validator allows it). The field keeps the `WeekdayFormat` type, as
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

/** How a mini month looks: its month grid, its title and its size. */
export interface MiniMonthStyle extends MonthGridOptions {
	/** Whether the title above the grid names the year after the month, or the month alone. */
	showYear: boolean
	size: MiniMonthSize
}

/** The default look: medium, titled with its month alone, with the default grid. */
export function miniMonthStyleDefaults(): MiniMonthStyle {
	return { showYear: false, size: 'medium', ...monthGridDefaults() }
}

export const MINI_MONTH_STYLE_VALIDATORS: Validators<MiniMonthStyle> = {
	showYear: isBoolean,
	size: oneOf(MINI_MONTH_SIZES),
	...MONTH_GRID_VALIDATORS,
}

/** A month drawn small beside a page's main content, for context; it can be left out. */
export interface MiniMonthOptions extends MiniMonthStyle {
	show: boolean
	/** Whether the days with an event are circled. */
	showEvents: boolean
}

/**
 * The default mini month: shown, medium, titled with its month alone, its days with an event
 * circled, with week numbers.
 */
export function miniMonthDefaults(): MiniMonthOptions {
	return {
		show: true,
		showYear: false,
		showEvents: true,
		size: 'medium',
		...monthGridDefaults(),
		showWeekNumbers: true,
	}
}

export const MINI_MONTH_VALIDATORS: Validators<MiniMonthOptions> = {
	show: isBoolean,
	showEvents: isBoolean,
	...MINI_MONTH_STYLE_VALIDATORS,
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

/** The days of `month` that have an event, for its `eventDays`; none of the days of other months. */
export function monthEventDays(events: readonly CalendarEvent[], month: CalendarMonth): number[] {
	return month.weeks
		.flat()
		.filter((day) => day.inMonth && eventNames(events, day).length > 0)
		.map((day) => day.day)
}

/** What a mini month marks for the page it is on: its day, its week, the days with an event. */
export type MiniMonthMarks = Pick<MiniMonthPlan, 'markedDay' | 'markedWeek' | 'eventDays'>

/**
 * Plans the mini months of a layout's pages in `style`: each a month given, titled with its name,
 * followed by its year with `showYear`, with the marks given. The weekday labels are built once,
 * every mini month sharing them.
 */
export function miniMonthPlanner(
	style: MiniMonthStyle,
	locale: string,
	model: CalendarModel,
): (month: CalendarMonth, marks?: MiniMonthMarks) => MiniMonthPlan {
	const weekdays = weekdayNames(locale, model.weekStart, style.weekdayFormat)
	return (month, marks = {}) => ({
		month,
		name: style.showYear
			? monthYearName(locale, month.year, month.month)
			: model.monthNames[month.month],
		weekdays,
		highlightWeekends: style.highlightWeekends,
		showWeekNumbers: style.showWeekNumbers,
		size: style.size,
		...marks,
	})
}

/**
 * The month `offset` months from `month`, maybe in another year: the model's own when it is of the
 * model's year, so a month the year already holds isn't built again.
 */
export function monthAt(model: CalendarModel, month: CalendarMonth, offset: number): CalendarMonth {
	const months = month.month + offset
	const year = month.year + Math.floor(months / 12)
	const index = ((months % 12) + 12) % 12
	const ofModel = model.months[index]
	return ofModel.year === year ? ofModel : buildMonth(year, index, model.weekStart)
}
