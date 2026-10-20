import { type CalendarDay, visibleWeeks } from '../../core/calendar'
import { monthYearName, weekdayNames } from '../../core/locale'
import type { WeekendHighlight } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
import type { MonthPerPageConfig } from './options'

/** A month drawn as a page of large writing cells: the props of the `MonthGrid` that draws it. */
export interface MonthGridPlan {
	/** The rows holding a day of the month: 4–6, as on a wall calendar. */
	weeks: CalendarDay[][]
	/** Weekday labels, ordered from the week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
}

/** One month's page. */
export interface MonthPage {
	/** The month, 0–11, unique per page. */
	key: number
	/** E.g. "January 2026". */
	heading: string
	/** Where the heading sits above the grid. */
	headingAlign: HeadingAlign
	grid: MonthGridPlan
}

/** Twelve pages, one per month. */
export function planMonthPages(config: MonthPerPageConfig, model: CalendarModel): MonthPage[] {
	const weekdays = weekdayNames(config.locale, model.weekStart, config.weekdayFormat)
	return model.months.map((month) => ({
		key: month.month,
		heading: monthYearName(config.locale, config.year, month.month),
		headingAlign: config.monthHeadingAlignment,
		grid: {
			weeks: visibleWeeks(month),
			weekdays,
			highlightWeekends: config.highlightWeekends,
			showWeekNumbers: config.showWeekNumbers,
		},
	}))
}
