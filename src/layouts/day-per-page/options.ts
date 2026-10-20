import { isBoolean, oneOf } from '../../core/validation'
import { isHeadingFontSize } from '../heading'
import { COMMON_VALIDATORS, type CommonConfig, commonDefaults } from '../common'
import type { LayoutSpec } from '../LayoutSpec'
import { MINI_MONTH_VALIDATORS, type MiniMonthOptions, miniMonthDefaults } from '../monthGrid'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from '../schedule'

/**
 * What fills a `day-per-page` page under its header: an hourly schedule, plain ruled lines, a
 * grid of squares like a math notebook's, or nothing, the page left blank.
 */
export const DAY_PAGE_LINES = ['hours', 'ruled', 'squares', 'blank'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

/** What a `day-per-page` page's heading shows; the other one goes in the subheading. */
export const DAY_PAGE_TITLES = ['weekday', 'date'] as const
export type DayPageTitle = (typeof DAY_PAGE_TITLES)[number]

/** Bounds of the distance between ruled lines, in mm. */
export const MIN_RULED_LINE_SPACING = 4
export const MAX_RULED_LINE_SPACING = 20

/** A distance between ruled lines, in mm, from `MIN_RULED_LINE_SPACING` to `MAX_RULED_LINE_SPACING`. */
export function isRuledLineSpacing(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_RULED_LINE_SPACING &&
		value <= MAX_RULED_LINE_SPACING
	)
}

/** Bounds of the side of a square in the `squares` fill, in mm. */
export const MIN_SQUARE_SIZE = 3
export const MAX_SQUARE_SIZE = 10

/** The side of a square, in mm, from `MIN_SQUARE_SIZE` to `MAX_SQUARE_SIZE`. */
export function isSquareSize(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_SQUARE_SIZE &&
		value <= MAX_SQUARE_SIZE
	)
}

/**
 * Where the grid of squares sits across the page inside its margins, the space left by the whole
 * squares that fit going on the other side, or on both.
 */
export const SQUARE_GRID_ALIGNMENTS = ['left', 'center', 'right'] as const
export type SquareGridAlignment = (typeof SQUARE_GRID_ALIGNMENTS)[number]

export interface DayPerPageConfig extends CommonConfig, HourSchedule {
	/** Whether the heading is the weekday ("Thursday") or the date ("1 January 2026"). */
	dayPageTitle: DayPageTitle
	/** The heading's font size, in pt; the subheading keeps its own. */
	headingFontSize: number
	/** What fills the page under its header; the schedule's hours come from `HourSchedule`. */
	dayPageLines: DayPageLines
	/** The distance between ruled lines, in mm; only used when `dayPageLines` is `ruled`. */
	ruledLineSpacing: number
	/** The side of a square, in mm; only used when `dayPageLines` is `squares`. */
	squareSize: number
	/** Where the grid of squares sits across the page; only used when `dayPageLines` is `squares`. */
	squareGridAlignment: SquareGridAlignment
	/**
	 * Whether each day takes two pages: the second, without a header, continues the ruled lines or
	 * holds the second half of the schedule's hours.
	 */
	twoPagesPerDay: boolean
	/** Whether the heading is drawn in the weekend color on Saturdays and Sundays. */
	highlightWeekendDays: boolean
	/** The day's month, drawn small in the top right corner with the day marked. */
	miniMonth: MiniMonthOptions
	/** Whether the header's details line shows the ISO week ("Week 1"). */
	showHeaderWeek: boolean
	/** Whether the header's details line shows the day of the year ("Day 1 / 365"). */
	showHeaderDayOfYear: boolean
}

export const DAY_PER_PAGE_SPEC: LayoutSpec<DayPerPageConfig> = {
	// A tall schedule fits portrait.
	defaults: () => ({
		...commonDefaults(),
		dayPageTitle: 'date',
		headingFontSize: 24,
		dayPageLines: 'hours',
		ruledLineSpacing: 8,
		// A math notebook's squares.
		squareSize: 5,
		squareGridAlignment: 'left',
		twoPagesPerDay: false,
		...scheduleDefaults(),
		highlightWeekendDays: true,
		miniMonth: miniMonthDefaults(),
		showHeaderWeek: true,
		showHeaderDayOfYear: true,
	}),
	validators: {
		...COMMON_VALIDATORS,
		dayPageTitle: oneOf(DAY_PAGE_TITLES),
		headingFontSize: isHeadingFontSize,
		dayPageLines: oneOf(DAY_PAGE_LINES),
		ruledLineSpacing: isRuledLineSpacing,
		squareSize: isSquareSize,
		squareGridAlignment: oneOf(SQUARE_GRID_ALIGNMENTS),
		twoPagesPerDay: isBoolean,
		...SCHEDULE_VALIDATORS,
		highlightWeekendDays: isBoolean,
		miniMonth: MINI_MONTH_VALIDATORS,
		showHeaderWeek: isBoolean,
		showHeaderDayOfYear: isBoolean,
	},
	normalize: orderHours,
}
