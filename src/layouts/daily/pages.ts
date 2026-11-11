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
import { type MiniMonthPlan, monthEventDays } from '../monthGrid'
import {
	type DailyOptions,
	GENKO_YOSHI_COLUMN_GAP_PERCENT,
	GENKO_YOSHI_FURIGANA_DIVISOR,
	type GenkoYoshiDirection,
	type GenkoYoshiFurigana,
	type FillAlignment,
} from './options'

/** The dot between the subheading's parts, with en spaces either side for more room than plain ones. */
const SUBHEADING_SEPARATOR = '\u2002·\u2002'

/**
 * Genkō yōshi, Japanese manuscript paper: columns of squares `size` mm a side, one per character,
 * or rows of them per `direction`, each with a furigana strip `furiganaSize` mm wide above it or
 * right of it per `furigana`, a blank `gap` mm wide between one column's (or row's) lines and the
 * next's, at most `rows` by `columns`, as many as fit whole in the area left, set across it per
 * `align`. With `guides`, dotted lines
 * divide each square, not its strip, in half, across and down.
 */
export interface GenkoYoshiFill {
	kind: 'genkoYoshi'
	rows: number
	columns: number
	size: number
	gap: number
	direction: GenkoYoshiDirection
	furigana: GenkoYoshiFurigana
	furiganaSize: number
	guides: boolean
	align: FillAlignment
}

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
			align: FillAlignment
	  }
	/**
	 * Dots at the corners of squares `size` mm a side: of at most `rows` by `columns` squares, as
	 * many as fit whole in the area left, the rest of it blank, set across it per `align`.
	 */
	| {
			kind: 'dots'
			rows: number
			columns: number
			size: number
			align: FillAlignment
	  }
	| GenkoYoshiFill
	/** Nothing: the page is left blank under its header. */
	| { kind: 'blank' }

/** Everything one day prints, on one sheet or two. */
export interface DayPages {
	day: CalendarDay
	/** The weekday or the date, per the header's `heading`. */
	heading: string
	/** The heading's font size, in pt (the header's `fontSize`). */
	headingFontSize: number
	/**
	 * The other one of the two, then the details "Week 1 · Day 1 / 365", each part per its option,
	 * all separated by dots.
	 */
	subheading: string
	/** The names of the day's events, under the heading. */
	events: string[]
	/** Whether the heading takes the weekend color: a Saturday or Sunday, with the header's `highlightWeekendDays`. */
	weekend: boolean
	/**
	 * The day's month with the day marked and, with `miniMonth.showEvents`, the days with an event
	 * circled, in the corner; none when hidden.
	 */
	miniMonth?: MiniMonthPlan
	/** What fills each sheet: one, or two with the content's `twoPages`, the second without a header. */
	fills: DayFill[]
	/** The height of the empty footer at the bottom of each sheet, in mm; none unless `footer.show`. */
	footerHeight?: number
}

/**
 * The fills of every day's sheets, the same for every day, per the content's `fill`. Ruled lines, `ruledLineSpacing` apart, fill the page inside its
 * margins (the header takes some of that height, and the ruled area clips the lines that don't
 * fit); over two sheets they continue. Squares, `squareSize` a side, fill it with as many whole squares
 * as fit across and down, the header's height being known only once drawn, set across the page per
 * `fillAlignment`; dots mark those squares' corners. Genkō yōshi fills it likewise with
 * columns of its own squares, or rows per `genkoYoshi.direction`, `genkoYoshi.squareSize` a side,
 * apart by `GENKO_YOSHI_COLUMN_GAP_PERCENT` of that side, set across the page per `fillAlignment`, with
 * a furigana strip, a third of a square's side (`GENKO_YOSHI_FURIGANA_DIVISOR`), by each square per
 * `genkoYoshi.furigana`, and dotted guides halving its squares per `genkoYoshi.guides`. A blank fill leaves every sheet empty. The hours are split in half over two sheets, the second,
 * having no header, taking the extra hour of an odd count.
 */
function planFills(options: DailyOptions): DayFill[] {
	const { content } = options
	const sheets = content.twoPages ? 2 : 1
	if (content.fill === 'ruled') {
		const spacing = content.ruledLineSpacing
		const lines = Math.ceil(contentBox(options.page).height / spacing)
		const fill: DayFill = { kind: 'ruled', lines, spacing }
		return Array.from({ length: sheets }, () => fill)
	}
	if (content.fill === 'blank') {
		const fill: DayFill = { kind: 'blank' }
		return Array.from({ length: sheets }, () => fill)
	}
	if (content.fill === 'squares' || content.fill === 'dots') {
		const { width, height } = contentBox(options.page)
		const size = content.squareSize
		const fill: DayFill = {
			kind: content.fill,
			rows: Math.floor(height / size),
			columns: Math.floor(width / size),
			size,
			align: content.fillAlignment,
		}
		return Array.from({ length: sheets }, () => fill)
	}
	if (content.fill === 'genkoYoshi') {
		const { width, height } = contentBox(options.page)
		const { genkoYoshi } = content
		const size = genkoYoshi.squareSize
		const gap = (size * GENKO_YOSHI_COLUMN_GAP_PERCENT) / 100
		const furigana = genkoYoshi.furigana
		const furiganaSize = size / GENKO_YOSHI_FURIGANA_DIVISOR
		const cellWidth = size + (furigana === 'right' ? furiganaSize : 0)
		const cellHeight = size + (furigana === 'top' ? furiganaSize : 0)
		const direction = genkoYoshi.direction
		// n columns (or rows) take n cells and n - 1 gaps.
		const columnGap = direction === 'vertical' ? gap : 0
		const rowGap = direction === 'horizontal' ? gap : 0
		const fill: GenkoYoshiFill = {
			kind: 'genkoYoshi',
			rows: Math.floor((height + rowGap) / (cellHeight + rowGap)),
			columns: Math.floor((width + columnGap) / (cellWidth + columnGap)),
			size,
			gap,
			direction,
			furigana,
			furiganaSize,
			guides: genkoYoshi.guides,
			align: content.fillAlignment,
		}
		return Array.from({ length: sheets }, () => fill)
	}
	const { locale } = options.calendar
	const { firstHour, lastHour, hourFormat } = content.schedule
	const hours = hourNames(locale, firstHour, lastHour, hourFormat)
	const split = Math.floor(hours.length / sheets)
	return sheets === 1
		? [{ kind: 'hours', hours }]
		: [
				{ kind: 'hours', hours: hours.slice(0, split) },
				{ kind: 'hours', hours: hours.slice(split) },
			]
}

/** A page, or two, for every day of the year. */
export function planDayPages(options: DailyOptions, model: CalendarModel): DayPages[] {
	const { locale } = options.calendar
	const { header, miniMonth } = options
	const messages = DAY_PAGE_MESSAGES[locale]
	const miniWeekdays = weekdayNames(locale, model.weekStart, miniMonth.weekdayFormat)
	const fills = planFills(options)
	const footerHeight = options.footer.show ? options.footer.height : undefined
	const days = daysOfYear(model.months)
	const eventDays = model.months.map((month) =>
		miniMonth.showEvents ? monthEventDays(model.events, month) : [],
	)

	return days.map((day) => {
		const weekday = weekdayName(locale, day)
		const date = fullDateName(locale, day)
		const subheading = [
			header.heading === 'weekday' ? date : weekday,
			header.showWeek ? messages.week(isoWeek(day)) : '',
			header.showDayOfYear ? messages.dayOfYear(dayOfYear(day), days.length) : '',
		]
			.filter(Boolean)
			.join(SUBHEADING_SEPARATOR)
		return {
			day,
			heading: header.heading === 'weekday' ? weekday : date,
			headingFontSize: header.fontSize,
			subheading,
			events: eventNames(model.events, day),
			weekend: header.highlightWeekendDays && day.isWeekend,
			miniMonth: miniMonth.show
				? {
						month: model.months[day.month],
						name: miniMonth.showYear
							? monthYearName(locale, day.year, day.month)
							: model.monthNames[day.month],
						weekdays: miniWeekdays,
						highlightWeekends: miniMonth.highlightWeekends,
						showWeekNumbers: miniMonth.showWeekNumbers,
						size: miniMonth.size,
						markedDay: day.day,
						eventDays: eventDays[day.month],
					}
				: undefined,
			fills,
			footerHeight,
		}
	})
}
