import { buildMonth, type CalendarDay, visibleWeeks } from '../../core/calendar'
import { eventNames } from '../../core/events'
import { monthYearName, weekdayNames } from '../../core/locale'
import type { WeekendHighlight } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
import type { MiniMonthPlan } from '../monthGrid'
import type { MonthPerPageConfig } from './options'

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
	grid: MonthGridPlan
	/** The month before, drawn small at the top left; left out when hidden. */
	previousMonth?: MiniMonthPlan
	/** The month after, drawn small at the top right; left out when hidden. */
	nextMonth?: MiniMonthPlan
}

/**
 * Twelve pages, one per month, headed by the title, if any, above the month and year, between the
 * previous and the next month drawn small, each when `adjacentMonths` shows it.
 */
export function planMonthPages(config: MonthPerPageConfig, model: CalendarModel): MonthPage[] {
	const { locale, year, adjacentMonths } = config
	const weekdays = weekdayNames(locale, model.weekStart, config.weekdayFormat)
	const miniWeekdays = weekdayNames(locale, model.weekStart, adjacentMonths.weekdayFormat)
	const title = config.title.trim()

	/** The month `offset` (±1) months from `month` of the year, named with its year. */
	function planMiniMonth(month: number, offset: number): MiniMonthPlan {
		const otherYear = year + Math.floor((month + offset) / 12)
		const otherMonth = (month + offset + 12) % 12
		return {
			month: buildMonth(otherYear, otherMonth, model.weekStart),
			name: monthYearName(locale, otherYear, otherMonth),
			weekdays: miniWeekdays,
			highlightWeekends: adjacentMonths.highlightWeekends,
			showWeekNumbers: adjacentMonths.showWeekNumbers,
		}
	}

	return model.months.map((month) => {
		const monthYear = monthYearName(locale, year, month.month)
		return {
			key: month.month,
			heading: title || monthYear,
			subheading: title ? monthYear : '',
			headingAlign: config.monthHeadingAlignment,
			grid: {
				weeks: visibleWeeks(month).map((week) =>
					week.map((day) => ({
						...day,
						events: day.inMonth ? eventNames(model.events, day) : [],
					})),
				),
				weekdays,
				highlightWeekends: config.highlightWeekends,
				showWeekNumbers: config.showWeekNumbers,
			},
			previousMonth: adjacentMonths.showPreviousMonth
				? planMiniMonth(month.month, -1)
				: undefined,
			nextMonth: adjacentMonths.showNextMonth ? planMiniMonth(month.month, 1) : undefined,
		}
	})
}
