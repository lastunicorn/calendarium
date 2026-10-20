import { type CalendarDay, dayOfYear, daysOfYear, isoWeek } from '../../core/calendar'
import { fullDateName, hourNames, weekdayName, weekdayNames } from '../../core/locale'
import { PRINT_MESSAGES } from '../../core/messages'
import { contentBox } from '../../core/paper'
import type { CalendarModel } from '../common'
import type { MiniMonthPlan } from '../monthGrid'
import type { DayPerPageConfig } from './options'

/** The side of a square in the `squares` fill, in mm: a math notebook's. */
const SQUARE_SIZE = 5

/** What fills a day's sheet under its header, or all of its second sheet. */
export type DayFill =
	/** One row per hour, labeled. */
	| { kind: 'hours'; hours: string[] }
	/** `lines` ruled lines, `spacing` mm apart. */
	| { kind: 'ruled'; lines: number; spacing: number }
	/** A grid of `rows` by `columns` squares, `size` mm a side. */
	| { kind: 'squares'; rows: number; columns: number; size: number }

/** Everything one day prints, on one sheet or two. */
export interface DayPages {
	day: CalendarDay
	/** The weekday or the date, per `dayPageTitle`. */
	heading: string
	/** The other one of the two. */
	subheading: string
	/** "Week 1 · Day 1 / 365", each part per its option; empty when both are off. */
	details: string
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
 * fit); over two sheets they continue. Squares fill it the same way, across and down. The hours are split in half over two sheets, the first
 * taking the extra hour of an odd count.
 */
function planFills(config: DayPerPageConfig): DayFill[] {
	const sheets = config.twoPagesPerDay ? 2 : 1
	if (config.dayPageLines === 'ruled') {
		const spacing = config.ruledLineSpacing
		const lines = Math.ceil(contentBox(config.page).height / spacing)
		const fill: DayFill = { kind: 'ruled', lines, spacing }
		return Array.from({ length: sheets }, () => fill)
	}
	if (config.dayPageLines === 'squares') {
		const { width, height } = contentBox(config.page)
		const fill: DayFill = {
			kind: 'squares',
			rows: Math.ceil(height / SQUARE_SIZE),
			columns: Math.ceil(width / SQUARE_SIZE),
			size: SQUARE_SIZE,
		}
		return Array.from({ length: sheets }, () => fill)
	}
	const hours = hourNames(config.locale, config.firstHour, config.lastHour, config.hourFormat)
	const split = Math.ceil(hours.length / sheets)
	return sheets === 1
		? [{ kind: 'hours', hours }]
		: [
				{ kind: 'hours', hours: hours.slice(0, split) },
				{ kind: 'hours', hours: hours.slice(split) },
			]
}

/** A page, or two, for every day of the year. */
export function planDayPages(config: DayPerPageConfig, model: CalendarModel): DayPages[] {
	const { locale, miniMonth } = config
	const messages = PRINT_MESSAGES[locale]
	const miniWeekdays = weekdayNames(locale, model.weekStart, miniMonth.weekdayFormat)
	const fills = planFills(config)
	const days = daysOfYear(model.months)

	return days.map((day) => {
		const weekday = weekdayName(locale, day)
		const date = fullDateName(locale, day)
		const details = [
			config.showHeaderWeek ? messages.week(isoWeek(day)) : '',
			config.showHeaderDayOfYear ? messages.dayOfYear(dayOfYear(day), days.length) : '',
		]
			.filter(Boolean)
			.join(' · ')
		return {
			day,
			heading: config.dayPageTitle === 'weekday' ? weekday : date,
			subheading: config.dayPageTitle === 'weekday' ? date : weekday,
			details,
			weekend: config.highlightWeekendDays && day.isWeekend,
			miniMonth: miniMonth.show
				? {
						month: model.months[day.month],
						name: model.monthNames[day.month],
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
