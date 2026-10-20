import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import { margins } from '../../core/paper'
import { isBoolean, oneOf } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonConfig, commonDefaults } from '../common'
import { HEADING_ALIGNMENTS, type HeadingAlignment, isHeadingFontSize } from '../heading'
import type { LayoutSpec } from '../LayoutSpec'
import { MINI_MONTH_VALIDATORS, type MiniMonthOptions, miniMonthDefaults } from '../monthGrid'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from '../schedule'
import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from './cells'

/** What fills each day's cell on a `week-per-page` page under its label: nothing, or an hourly schedule. */
export const WEEK_PAGE_LINES = ['none', 'hours'] as const
export type WeekPageLines = (typeof WEEK_PAGE_LINES)[number]

/**
 * The page the first week prints on: `odd`, the first sheet, or `even`, after a blank sheet, so
 * that printed double-sided, each week's two pages face each other.
 */
export const START_PAGES = ['odd', 'even'] as const
export type StartPage = (typeof START_PAGES)[number]

export interface WeekPerPageConfig extends CommonConfig, HourSchedule {
	/** How the weekday name in each day's cell is written: in full or abbreviated. */
	weekdayFormat: WeekdayFormat
	/** Whether the weekend days of the year get the weekend color; other years' days stay gray. */
	highlightWeekendDays: boolean
	/** Whether the heading shows the week's ISO number ("Week 1"). */
	showHeaderWeek: boolean
	/**
	 * Where the heading sits across the header row; `auto` sets it to the left beside the mini
	 * month or over two pages, centered otherwise (`headingAlign`).
	 */
	headingAlignment: HeadingAlignment
	/** The heading's font size, in pt; the subheading keeps its own. */
	headingFontSize: number
	/** Whether Saturday and Sunday get a cell each, share one, or are left out. */
	weekendDisplay: WeekendDisplay
	/**
	 * What fills each day's cell; the schedule's hours come from `HourSchedule`. Saturday and
	 * Sunday sharing a cell have no room for one, so only the other days get it; days of
	 * the previous and next year never do.
	 */
	weekPageLines: WeekPageLines
	/**
	 * Whether each week takes two pages: its first three days on the first, under the heading,
	 * and the rest on the second, under the mini month (if shown) in the top right.
	 */
	twoPagesPerWeek: boolean
	/** Whether the first week starts on the first page, or on the second after a blank one. */
	startPage: StartPage
	/** Whether the days are columns or rows (`stacksDays`). */
	weekDayDirection: WeekDayDirection
	/** The week's month (`weekMonth`), drawn small beside the heading with the week marked. */
	miniMonth: MiniMonthOptions
}

export const WEEK_PER_PAGE_SPEC: LayoutSpec<WeekPerPageConfig> = {
	// Columns side by side fit landscape, with room for three-letter weekdays. The weekend
	// shares a cell, leaving the weekdays room for an hourly schedule.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			highlightWeekendDays: true,
			showHeaderWeek: true,
			headingAlignment: 'auto',
			headingFontSize: 20,
			weekendDisplay: 'reduced',
			weekPageLines: 'hours',
			twoPagesPerWeek: false,
			startPage: 'odd',
			weekDayDirection: 'auto',
			...scheduleDefaults(),
			miniMonth: miniMonthDefaults(),
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		weekdayFormat: oneOf(WEEKDAY_FORMATS),
		highlightWeekendDays: isBoolean,
		showHeaderWeek: isBoolean,
		headingAlignment: oneOf(HEADING_ALIGNMENTS),
		headingFontSize: isHeadingFontSize,
		weekendDisplay: oneOf(WEEKEND_DISPLAYS),
		weekPageLines: oneOf(WEEK_PAGE_LINES),
		twoPagesPerWeek: isBoolean,
		startPage: oneOf(START_PAGES),
		weekDayDirection: oneOf(WEEK_DAY_DIRECTIONS),
		...SCHEDULE_VALIDATORS,
		miniMonth: MINI_MONTH_VALIDATORS,
	},
	normalize: orderHours,
}
