import {
	type WeekDay,
	weekdayColumn,
	weekMonth,
	weekNumber,
	weeksOfYear,
} from '../../core/calendar'
import { eventNames } from '../../core/events'
import { dateRangeName, hourNames, weekdayNames } from '../../core/locale'
import { PRINT_MESSAGES } from '../../core/messages'
import { isHighlightedWeekDay } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
import type { MiniMonthPlan } from '../monthGrid'
import { splitWeekCells, stacksDays, type WeekCell, weekCells } from './cells'
import type { WeekPerPageConfig } from './options'

/** One day as a week page draws it: the results of the layout's rules, not their inputs. */
export interface WeekPageDay {
	day: WeekDay
	/** Its weekday, in the layout's `weekdayFormat`. */
	weekday: string
	/** Its month's name: where the month changes, and on each sheet's first day for context. */
	monthName?: string
	/** In the weekend color: a weekend day of the year, with `highlightWeekendDays`. */
	highlighted: boolean
	/** The names of its events, under its label; none for a day of another year. */
	events: string[]
	/**
	 * Whether its cell holds the hourly schedule: with `weekPageLines` set to `hours`, a day of the
	 * year in a cell of its own. Saturday and Sunday sharing a cell have no room for one.
	 */
	schedule: boolean
}

/**
 * The part of the header row a sheet shows: a single sheet both, the first of two the heading, the
 * second the mini month. The part left out keeps its space, hidden, so both sheets' cells start at
 * the same height.
 */
export type WeekHeaderPart = 'both' | 'heading' | 'miniMonth'

/** One printed sheet of a week. */
export interface WeekSheet {
	header: WeekHeaderPart
	/** Its cells in order, each holding one day, or Saturday and Sunday sharing it. */
	cells: WeekPageDay[][]
	/**
	 * The lines every cell keeps for events under its label: the most any of its days has, so the
	 * cells' schedules start at the same height.
	 */
	eventLines: number
}

/** Everything one week prints, on one sheet or two. */
export interface WeekPages {
	/** Its first day's key, unique per week. */
	key: string
	/** The week's dates, e.g. "19 – 25 October 2026". */
	heading: string
	/** "Week 43", or empty without `showHeaderWeek`. */
	subheading: string
	/** Where the heading and subheading sit across the header row (`headingAlign`). */
	headingAlign: HeadingAlign
	/** The month holding most of the week's days, the week framed; none when hidden. */
	miniMonth?: MiniMonthPlan
	/** Whether the days are stacked rows rather than columns side by side (`stacksDays`). */
	stacked: boolean
	/** One sheet, or two with `twoPagesPerWeek` (`splitWeekCells`). */
	sheets: WeekSheet[]
}

export interface WeekPlan {
	/** Labels of the hourly schedule, one array for every page; none when no cell holds one. */
	hours?: string[]
	/** The weeks that get pages, in order. */
	weeks: WeekPages[]
}

/**
 * Where a week's heading sits: as `headingAlignment` says, or for `auto` to the left beside the
 * mini month and on the first of two pages, where the second's header is the mini month's, and
 * centered over a single page without it.
 */
export function headingAlign({
	headingAlignment,
	miniMonth,
	twoPagesPerWeek,
}: WeekPerPageConfig): HeadingAlign {
	if (headingAlignment !== 'auto') return headingAlignment
	return miniMonth.show || twoPagesPerWeek ? 'left' : 'center'
}

/**
 * The year's week pages: every week holding a day of the year, from the one with January 1 to the
 * one with December 31, except a week whose only days of the year are a hidden weekend.
 */
export function planWeekPages(config: WeekPerPageConfig, model: CalendarModel): WeekPlan {
	const { locale, miniMonth, twoPagesPerWeek } = config
	const { weekStart, months, monthNames } = model
	const weekdays = weekdayNames(locale, weekStart, config.weekdayFormat)
	const miniWeekdays = weekdayNames(locale, weekStart, miniMonth.weekdayFormat)
	const withSchedule = config.weekPageLines === 'hours'
	const stacked = stacksDays(config.weekDayDirection, config.page.orientation, twoPagesPerWeek)

	function planDay(day: WeekDay, firstOnSheet: boolean, shared: boolean): WeekPageDay {
		return {
			day,
			weekday: weekdays[weekdayColumn(day.weekday, weekStart)],
			monthName: firstOnSheet || day.day === 1 ? monthNames[day.month] : undefined,
			highlighted: isHighlightedWeekDay(day, config.highlightWeekendDays),
			events: day.inYear ? eventNames(model.events, day) : [],
			schedule: withSchedule && !shared && day.inYear,
		}
	}

	function planSheet(cells: WeekCell[], header: WeekHeaderPart): WeekSheet {
		const firstDay = cells[0][0]
		const planned = cells.map((cell) =>
			cell.map((day) => planDay(day, day === firstDay, cell.length > 1)),
		)
		return {
			header,
			cells: planned,
			eventLines: Math.max(...planned.flat().map((day) => day.events.length)),
		}
	}

	function planWeek(cells: WeekCell[]): WeekPages {
		const days = cells.flat()
		const month = weekMonth(days)
		const [firstCells, secondCells] = splitWeekCells(cells)
		return {
			key: days[0].key,
			heading: dateRangeName(locale, days[0], days.at(-1)!),
			subheading: config.showHeaderWeek ? PRINT_MESSAGES[locale].week(weekNumber(days)) : '',
			headingAlign: headingAlign(config),
			miniMonth: miniMonth.show
				? {
						month: months[month],
						name: monthNames[month],
						weekdays: miniWeekdays,
						highlightWeekends: miniMonth.highlightWeekends,
						showWeekNumbers: miniMonth.showWeekNumbers,
						markedWeek: days[0].key,
					}
				: undefined,
			stacked,
			sheets: twoPagesPerWeek
				? [planSheet(firstCells, 'heading'), planSheet(secondCells, 'miniMonth')]
				: [planSheet(cells, 'both')],
		}
	}

	const weeks = weeksOfYear(config.year, weekStart)
		.map((week) => weekCells(week, config.weekendDisplay))
		.filter((cells) => cells.some((cell) => cell.some((day) => day.inYear)))
		.map(planWeek)
	const hours = withSchedule
		? hourNames(locale, config.firstHour, config.lastHour, config.hourFormat)
		: undefined
	return { hours, weeks }
}
