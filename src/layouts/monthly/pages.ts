import { buildMonth, visibleWeeks, type CalendarDay } from '../../core/calendar'
import { eventNames } from '../../core/events'
import { monthYearName, weekdayNames } from '../../core/locale'
import type { WeekendHighlight } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
import type { MiniMonthPlan } from '../monthGrid'
import type { DayNumber, MonthlyOptions } from './options'

/** A day's cell in a month grid. */
export interface MonthGridDay extends CalendarDay {
	/** The names of its events, written in the cell; none for a day of another month. */
	events: string[]
}

/** A month drawn as a page of large writing cells: the props of the `MonthGrid` that draws it. */
export interface MonthGridPlan {
	/** The rows holding a day of the month: 4–6, as on a wall calendar. */
	weeks: MonthGridDay[][]
	/** Weekday labels, ordered from the week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	/** Whether the days of the previous and next month show their numbers, or leave their cells blank. */
	showAdjacentMonthDays: boolean
	/** Whether the cells are ruled, or only their contents are drawn. */
	showGridLines: boolean
	/** The size of the weekday names, in pt. */
	weekdayFontSize: number
	/** Each day's number: its size, in pt, and where it sits across and down its cell. */
	dayNumber: DayNumber
}

/** One month's page. */
export interface MonthPage {
	/** The month, 0–11, unique per page. */
	key: number
	/** The title, or the month and year, e.g. "January 2026", when the title is empty. */
	heading: string
	/** The month and year below the title; empty when they are the heading. */
	subheading: string
	/** Where the heading sits above the grid. */
	headingAlign: HeadingAlign
	/** The heading's font size, in pt (the header's `fontSize`). */
	headingFontSize: number
	grid: MonthGridPlan
	/** The month before, drawn small at the top left; left out when hidden. */
	previousMonth?: MiniMonthPlan
	/** The month after, drawn small at the top right; left out when hidden. */
	nextMonth?: MiniMonthPlan
}

/**
 * Twelve pages, one per month, headed by the title, if any, above the month and year, between the
 * previous and the next month drawn small, each when the `miniMonth` options show it.
 */
export function planMonthPages(options: MonthlyOptions, model: CalendarModel): MonthPage[] {
	const { year, locale } = options.calendar
	const { header, miniMonth, content } = options
	const weekdays = weekdayNames(locale, model.weekStart, content.weekdayFormat)
	const miniWeekdays = weekdayNames(locale, model.weekStart, miniMonth.weekdayFormat)
	const title = header.title.trim()

	/** The month `offset` (±1) months from `month` of the year, named with its year per `showYear`. */
	function planMiniMonth(month: number, offset: number): MiniMonthPlan {
		const otherYear = year + Math.floor((month + offset) / 12)
		const otherMonth = (month + offset + 12) % 12
		return {
			month: buildMonth(otherYear, otherMonth, model.weekStart),
			name: miniMonth.showYear
				? monthYearName(locale, otherYear, otherMonth)
				: model.monthNames[otherMonth],
			weekdays: miniWeekdays,
			highlightWeekends: miniMonth.highlightWeekends,
			showWeekNumbers: miniMonth.showWeekNumbers,
			size: miniMonth.size,
		}
	}

	return model.months.map((month) => {
		const monthYear = monthYearName(locale, year, month.month)
		return {
			key: month.month,
			heading: title || monthYear,
			subheading: title ? monthYear : '',
			headingAlign: header.alignment,
			headingFontSize: header.fontSize,
			grid: {
				weeks: visibleWeeks(month).map((week) =>
					week.map((day) => ({
						...day,
						events: day.inMonth ? eventNames(model.events, day) : [],
					})),
				),
				weekdays,
				highlightWeekends: content.highlightWeekends,
				showWeekNumbers: content.showWeekNumbers,
				showAdjacentMonthDays: content.showAdjacentMonthDays,
				showGridLines: content.showGridLines,
				weekdayFontSize: content.weekdayFontSize,
				dayNumber: content.dayNumber,
			},
			previousMonth: miniMonth.showPreviousMonth ? planMiniMonth(month.month, -1) : undefined,
			nextMonth: miniMonth.showNextMonth ? planMiniMonth(month.month, 1) : undefined,
		}
	})
}
