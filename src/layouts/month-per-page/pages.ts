import { type CalendarDay, visibleWeeks } from '../../core/calendar'
import { eventNames } from '../../core/events'
import { monthYearName, weekdayNames } from '../../core/locale'
import type { WeekendHighlight } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
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
}

/** Twelve pages, one per month, headed by the title, if any, above the month and year. */
export function planMonthPages(config: MonthPerPageConfig, model: CalendarModel): MonthPage[] {
	const weekdays = weekdayNames(config.locale, model.weekStart, config.weekdayFormat)
	const title = config.title.trim()
	return model.months.map((month) => {
		const monthYear = monthYearName(config.locale, config.year, month.month)
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
		}
	})
}
