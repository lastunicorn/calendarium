import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import { margins } from '../../core/paper'
import { isBoolean, oneOf, type Validators } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonOptions, commonDefaults, normalizeCommon } from '../common'
import { FOOTER_VALIDATORS, footerDefaults, type PageFooter } from '../footer'
import { HEADING_ALIGNMENTS, type HeadingAlignment, isHeadingFontSize } from '../heading'
import type { LayoutSpec } from '../LayoutSpec'
import { WEEKLY_MIGRATIONS } from './migrations'
import {
	MINI_MONTH_STYLE_VALIDATORS,
	type MiniMonthStyle,
	miniMonthStyleDefaults,
} from '../monthGrid'
import {
	type HourSchedule,
	orderContentHours,
	SCHEDULE_VALIDATORS,
	scheduleDefaults,
} from '../schedule'
import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from './cells'

/** What fills each day's cell on a `weekly` page under its label: nothing, or an hourly schedule. */
export const WEEK_PAGE_FILLS = ['none', 'hours'] as const
export type WeekPageFill = (typeof WEEK_PAGE_FILLS)[number]

/**
 * The page the first week prints on: `odd`, the first sheet, or `even`, after a blank sheet, so
 * that printed double-sided, each week's two pages face each other.
 */
export const START_PAGES = ['odd', 'even'] as const
export type StartPage = (typeof START_PAGES)[number]

/** The heading above each week's cells: the week's dates. */
export interface WeeklyHeader {
	/**
	 * Where the heading sits across the header row; `auto` sets it to the left beside the mini
	 * month or over two pages, centered otherwise (`headingAlign`).
	 */
	alignment: HeadingAlignment
	/** The heading's font size, in pt; the subheading keeps its own. */
	fontSize: number
	/** Whether the heading shows the week's ISO number ("Week 1"). */
	showWeek: boolean
}

/**
 * The week's month (`weekMonth`), drawn small beside the heading with the week marked, and the
 * month after it, right of it, looking like it.
 */
export interface WeeklyMiniMonth extends MiniMonthStyle {
	showCurrentMonth: boolean
	showNextMonth: boolean
	/** Whether the days with an event are circled. */
	showEvents: boolean
}

/** How a week's page (or two) is divided between its days, and what fills their cells. */
export interface WeeklyContent {
	/**
	 * Whether each week takes two pages: its first three days on the first, under the heading,
	 * and the rest on the second, under the mini month (if shown) in the top right.
	 */
	twoPages: boolean
	/** Whether the first week starts on the first page, or on the second after a blank one. */
	startPage: StartPage
	/** Whether the days are columns side by side or stacked rows. */
	dayDirection: WeekDayDirection
	/** How the weekday name in each day's cell is written: in full or abbreviated. */
	weekdayFormat: WeekdayFormat
	/** Whether the weekend days of the year get the weekend color; other years' days stay gray. */
	highlightWeekendDays: boolean
	/** Whether Saturday and Sunday get a cell each, share one, or are left out. */
	weekendDisplay: WeekendDisplay
	/**
	 * What fills each day's cell; the schedule's hours come from `schedule`. Saturday and Sunday
	 * sharing a cell have no room for one, so only the other days get it; days of the previous
	 * and next year never do.
	 */
	fill: WeekPageFill
	schedule: HourSchedule
}

export interface WeeklyOptions extends CommonOptions {
	header: WeeklyHeader
	miniMonth: WeeklyMiniMonth
	content: WeeklyContent
	/** The empty footer under each sheet's cells. */
	footer: PageFooter
}

const HEADER_VALIDATORS: Validators<WeeklyHeader> = {
	alignment: oneOf(HEADING_ALIGNMENTS),
	fontSize: isHeadingFontSize,
	showWeek: isBoolean,
}

const MINI_MONTH_VALIDATORS: Validators<WeeklyMiniMonth> = {
	showCurrentMonth: isBoolean,
	showNextMonth: isBoolean,
	showEvents: isBoolean,
	...MINI_MONTH_STYLE_VALIDATORS,
}

const CONTENT_VALIDATORS: Validators<WeeklyContent> = {
	twoPages: isBoolean,
	startPage: oneOf(START_PAGES),
	dayDirection: oneOf(WEEK_DAY_DIRECTIONS),
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekendDays: isBoolean,
	weekendDisplay: oneOf(WEEKEND_DISPLAYS),
	fill: oneOf(WEEK_PAGE_FILLS),
	schedule: SCHEDULE_VALIDATORS,
}

export const WEEKLY_SPEC: LayoutSpec<WeeklyOptions> = {
	// Columns side by side fit landscape, with room for three-letter weekdays. The weekend
	// shares a cell, leaving the weekdays room for an hourly schedule.
	defaults: () => {
		const { page, ...common } = commonDefaults()
		// The groups in sidebar order, which files keep: the page last.
		return {
			...common,
			header: { alignment: 'auto', fontSize: 20, showWeek: true },
			miniMonth: {
				showCurrentMonth: true,
				showNextMonth: false,
				showEvents: true,
				...miniMonthStyleDefaults(),
				showWeekNumbers: true,
			},
			content: {
				twoPages: false,
				startPage: 'odd',
				dayDirection: 'vertical',
				weekdayFormat: 'short',
				highlightWeekendDays: true,
				weekendDisplay: 'reduced',
				fill: 'hours',
				schedule: scheduleDefaults(),
			},
			footer: footerDefaults(),
			page: { ...page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		header: HEADER_VALIDATORS,
		miniMonth: MINI_MONTH_VALIDATORS,
		content: CONTENT_VALIDATORS,
		footer: FOOTER_VALIDATORS,
	},
	normalize: (options) => orderContentHours(normalizeCommon(options)),
	migrations: WEEKLY_MIGRATIONS,
}
