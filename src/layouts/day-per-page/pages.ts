import { type CalendarDay, dayOfYear, daysOfYear, isoWeek } from '../../core/calendar'
import { eventNames } from '../../core/events'
import {
	fullDateName,
	hourNames,
	monthYearName,
	weekdayName,
	weekdayNames,
} from '../../core/locale'
import { DAY_PAGE_MESSAGES } from './messages'
import { contentBox } from '../../core/paper'
import type { CalendarModel } from '../common'
import type { MiniMonthPlan } from '../monthGrid'
import type { DayPerPageOptions, SquareGridAlignment } from './options'

/** The dot between the subheading's parts, with en spaces either side for more room than plain ones. */
const SUBHEADING_SEPARATOR = '\u2002·\u2002'

/** What fills a day's sheet under its header, or all of its second sheet. */
export type DayFill =
	/** One row per hour, labeled. */
	| { kind: 'hours'; hours: string[] }
	/** `lines` ruled lines, `spacing` mm apart. */
	| { kind: 'ruled'; lines: number; spacing: number }
	/**
	 * A grid of squares `size` mm a side: at most `rows` by `columns`, as many as fit whole in the
	 * area left, the rest of it blank, set across it per `align`.
	 */
	| {
			kind: 'squares'
			rows: number
			columns: number
			size: number
			align: SquareGridAlignment
	  }
	/**
	 * Dots at the corners of squares `size` mm a side, as many whole squares as fit in the area
	 * left (the header's height being known only once drawn), set across it per `align`.
	 */
	| { kind: 'dots'; size: number; align: SquareGridAlignment }
	/** Nothing: the page is left blank under its header. */
	| { kind: 'blank' }

/** Everything one day prints, on one sheet or two. */
export interface DayPages {
	day: CalendarDay
	/** The weekday or the date, per `dayPageTitle`. */
	heading: string
	/** The heading's font size, in pt (`headingFontSize`). */
	headingFontSize: number
	/**
	 * The other one of the two, then the details "Week 1 · Day 1 / 365", each part per its option,
	 * all separated by dots.
	 */
	subheading: string
	/** The names of the day's events, under the heading. */
	events: string[]
	/** Whether the heading takes the weekend color: a Saturday or Sunday, with `highlightWeekendDays`. */
	weekend: boolean
	/** The day's month with the day marked, in the corner; none when hidden. */
	miniMonth?: MiniMonthPlan
	/** What fills each sheet: one, or two with `twoPagesPerDay`, the second without a header. */
	fills: DayFill[]
}

/**
 * The fills of every day's sheets, the same for every day. Ruled lines, `ruledLineSpacing` apart, fill the page inside its
 * margins (the header takes some of that height, and the ruled area clips the lines that don't
 * fit); over two sheets they continue. Squares, `squareSize` a side, fill it with as many whole squares
 * as fit across and down, the header's height being known only once drawn, set across the page per
 * `squareGridAlignment`; dots mark those squares' corners. A blank fill leaves every sheet empty. The hours are split in half over two sheets, the second,
 * having no header, taking the extra hour of an odd count.
 */
function planFills(options: DayPerPageOptions): DayFill[] {
	const sheets = options.twoPagesPerDay ? 2 : 1
	if (options.dayPageLines === 'ruled') {
		const spacing = options.ruledLineSpacing
		const lines = Math.ceil(contentBox(options.page).height / spacing)
		const fill: DayFill = { kind: 'ruled', lines, spacing }
		return Array.from({ length: sheets }, () => fill)
	}
	if (options.dayPageLines === 'blank') {
		const fill: DayFill = { kind: 'blank' }
		return Array.from({ length: sheets }, () => fill)
	}
	if (options.dayPageLines === 'squares') {
		const { width, height } = contentBox(options.page)
		const size = options.squareSize
		const fill: DayFill = {
			kind: 'squares',
			rows: Math.floor(height / size),
			columns: Math.floor(width / size),
			size,
			align: options.squareGridAlignment,
		}
		return Array.from({ length: sheets }, () => fill)
	}
	if (options.dayPageLines === 'dots') {
		const fill: DayFill = {
			kind: 'dots',
			size: options.squareSize,
			align: options.squareGridAlignment,
		}
		return Array.from({ length: sheets }, () => fill)
	}
	const hours = hourNames(options.locale, options.firstHour, options.lastHour, options.hourFormat)
	const split = Math.floor(hours.length / sheets)
	return sheets === 1
		? [{ kind: 'hours', hours }]
		: [
				{ kind: 'hours', hours: hours.slice(0, split) },
				{ kind: 'hours', hours: hours.slice(split) },
			]
}

/** A page, or two, for every day of the year. */
export function planDayPages(options: DayPerPageOptions, model: CalendarModel): DayPages[] {
	const { locale, miniMonth } = options
	const messages = DAY_PAGE_MESSAGES[locale]
	const miniWeekdays = weekdayNames(locale, model.weekStart, miniMonth.weekdayFormat)
	const fills = planFills(options)
	const days = daysOfYear(model.months)

	return days.map((day) => {
		const weekday = weekdayName(locale, day)
		const date = fullDateName(locale, day)
		const subheading = [
			options.dayPageTitle === 'weekday' ? date : weekday,
			options.showHeaderWeek ? messages.week(isoWeek(day)) : '',
			options.showHeaderDayOfYear ? messages.dayOfYear(dayOfYear(day), days.length) : '',
		]
			.filter(Boolean)
			.join(SUBHEADING_SEPARATOR)
		return {
			day,
			heading: options.dayPageTitle === 'weekday' ? weekday : date,
			headingFontSize: options.headingFontSize,
			subheading,
			events: eventNames(model.events, day),
			weekend: options.highlightWeekendDays && day.isWeekend,
			miniMonth: miniMonth.show
				? {
						month: model.months[day.month],
						name: miniMonth.showYear
							? monthYearName(locale, day.year, day.month)
							: model.monthNames[day.month],
						weekdays: miniWeekdays,
						highlightWeekends: miniMonth.highlightWeekends,
						showWeekNumbers: miniMonth.showWeekNumbers,
						markedDay: day.day,
					}
				: undefined,
			fills,
		}
	})
}
