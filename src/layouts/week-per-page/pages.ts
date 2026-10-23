import {
	type WeekDay,
	weekdayColumn,
	weekMonth,
	weekNumber,
	weeksOfYear,
} from '../../core/calendar'
import { eventNames } from '../../core/events'
import { dateRangeName, hourNames, monthYearName, weekdayNames } from '../../core/locale'
import { isHighlightedWeekDay } from '../../core/weekend'
import type { CalendarModel } from '../common'
import type { HeadingAlign } from '../heading'
import type { MiniMonthPlan } from '../monthGrid'
import { splitWeekCells, type WeekCell, weekCells } from './cells'
import { WEEK_PAGE_MESSAGES } from './messages'
import type { WeekPerPageOptions } from './options'

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
	 * The lines its cell keeps for events under its label. A day in a cell of its own keeps as many
	 * as the busiest such day of its sheet, so the cells' schedules start at the same height; Saturday
	 * and Sunday sharing a cell, which never hold a schedule, keep as many as the busier of the two.
	 */
	eventLines: number
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
	/** The heading's font size, in pt (`headingFontSize`). */
	headingFontSize: number
	/** The month holding most of the week's days, the week marked; none when hidden. */
	miniMonth?: MiniMonthPlan
	/** Whether the days are stacked rows rather than columns side by side (`weekDayDirection`). */
	stacked: boolean
	/** One sheet, or two with `twoPagesPerWeek` (`splitWeekCells`). */
	sheets: WeekSheet[]
	/** The height of the empty footer under each sheet's cells, in mm; none without `showFooter`. */
	footerHeight?: number
}

export interface WeekPlan {
	/** Whether a blank sheet comes first, so the first week starts on an even page (`startPage`). */
	blankFirstPage: boolean
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
}: WeekPerPageOptions): HeadingAlign {
	if (headingAlignment !== 'auto') return headingAlignment
	return miniMonth.show || twoPagesPerWeek ? 'left' : 'center'
}

/** The most events any of `days` has, 0 for none. */
function mostEvents(days: Pick<WeekPageDay, 'events'>[]): number {
	return Math.max(0, ...days.map((day) => day.events.length))
}

/**
 * The year's week pages: every week holding a day of the year, from the one with January 1 to the
 * one with December 31, except a week whose only days of the year are a hidden weekend.
 */
export function planWeekPages(options: WeekPerPageOptions, model: CalendarModel): WeekPlan {
	const { locale, miniMonth, twoPagesPerWeek } = options
	const { weekStart, months, monthNames } = model
	const weekdays = weekdayNames(locale, weekStart, options.weekdayFormat)
	const miniWeekdays = weekdayNames(locale, weekStart, miniMonth.weekdayFormat)
	const withSchedule = options.weekPageLines === 'hours'
	const stacked = options.weekDayDirection === 'horizontal'

	function planDay(
		day: WeekDay,
		firstOnSheet: boolean,
		shared: boolean,
	): Omit<WeekPageDay, 'eventLines'> {
		return {
			day,
			weekday: weekdays[weekdayColumn(day.weekday, weekStart)],
			monthName: firstOnSheet || day.day === 1 ? monthNames[day.month] : undefined,
			highlighted: isHighlightedWeekDay(day, options.highlightWeekendDays),
			events: day.inYear ? eventNames(model.events, day) : [],
			schedule: withSchedule && !shared && day.inYear,
		}
	}

	function planSheet(cells: WeekCell[], header: WeekHeaderPart): WeekSheet {
		const firstDay = cells[0][0]
		const planned = cells.map((cell) =>
			cell.map((day) => planDay(day, day === firstDay, cell.length > 1)),
		)
		const singleLines = mostEvents(planned.filter((cell) => cell.length === 1).flat())
		return {
			header,
			cells: planned.map((cell) => {
				const eventLines = cell.length === 1 ? singleLines : mostEvents(cell)
				return cell.map((day) => ({ ...day, eventLines }))
			}),
		}
	}

	function planWeek(cells: WeekCell[]): WeekPages {
		const days = cells.flat()
		const month = weekMonth(days)
		const [firstCells, secondCells] = splitWeekCells(cells)
		return {
			key: days[0].key,
			heading: dateRangeName(locale, days[0], days.at(-1)!),
			subheading: options.showHeaderWeek
				? WEEK_PAGE_MESSAGES[locale].week(weekNumber(days))
				: '',
			headingAlign: headingAlign(options),
			headingFontSize: options.headingFontSize,
			miniMonth: miniMonth.show
				? {
						month: months[month],
						name: miniMonth.showYear
							? monthYearName(locale, options.year, month)
							: monthNames[month],
						weekdays: miniWeekdays,
						highlightWeekends: miniMonth.highlightWeekends,
						showWeekNumbers: miniMonth.showWeekNumbers,
						size: miniMonth.size,
						markedWeek: days[0].key,
					}
				: undefined,
			stacked,
			sheets: twoPagesPerWeek
				? [planSheet(firstCells, 'heading'), planSheet(secondCells, 'miniMonth')]
				: [planSheet(cells, 'both')],
			footerHeight: options.showFooter ? options.footerHeight : undefined,
		}
	}

	const weeks = weeksOfYear(options.year, weekStart)
		.map((week) => weekCells(week, options.weekendDisplay))
		.filter((cells) => cells.some((cell) => cell.some((day) => day.inYear)))
		.map(planWeek)
	const hours = withSchedule
		? hourNames(locale, options.firstHour, options.lastHour, options.hourFormat)
		: undefined
	return { blankFirstPage: options.startPage === 'even', hours, weeks }
}
