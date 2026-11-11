import { isBoolean, oneOf, type Validators } from '../../core/validation'
import { FOOTER_VALIDATORS, footerDefaults, type PageFooter } from '../footer'
import { isHeadingFontSize } from '../heading'
import { COMMON_VALIDATORS, type CommonOptions, commonDefaults, normalizeCommon } from '../common'
import type { LayoutSpec } from '../LayoutSpec'
import { DAILY_MIGRATIONS } from './migrations'
import { MINI_MONTH_VALIDATORS, type MiniMonthOptions, miniMonthDefaults } from '../monthGrid'
import {
	type HourSchedule,
	orderContentHours,
	SCHEDULE_VALIDATORS,
	scheduleDefaults,
} from '../schedule'

/**
 * What fills a `daily` page under its header: an hourly schedule, plain ruled lines, a
 * grid of squares like a math notebook's, the dots at those squares' corners, genkō yōshi
 * (Japanese manuscript paper, a square for each character), or nothing, the page left blank.
 */
export const DAY_PAGE_FILLS = ['hours', 'ruled', 'squares', 'dots', 'genkoYoshi', 'blank'] as const
export type DayPageFill = (typeof DAY_PAGE_FILLS)[number]

/** What a `daily` page's heading shows; the other one goes in the subheading. */
export const DAY_PAGE_HEADINGS = ['weekday', 'date'] as const
export type DayPageHeading = (typeof DAY_PAGE_HEADINGS)[number]

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

/** Bounds of the side of a square in the `squares` fill, or between dots in the `dots` fill, in mm. */
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

/** Bounds of the side of a genkō yōshi square, in mm: room for one handwritten character. */
export const MIN_GENKO_YOSHI_SQUARE_SIZE = 10
export const MAX_GENKO_YOSHI_SQUARE_SIZE = 20

/**
 * The side of a genkō yōshi square, in mm, from `MIN_GENKO_YOSHI_SQUARE_SIZE` to
 * `MAX_GENKO_YOSHI_SQUARE_SIZE`.
 */
export function isGenkoYoshiSquareSize(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_GENKO_YOSHI_SQUARE_SIZE &&
		value <= MAX_GENKO_YOSHI_SQUARE_SIZE
	)
}

/**
 * The blank between two columns of genkō yōshi squares, in percent of a square's side: room for
 * furigana or emphasis marks beside the characters.
 */
export const GENKO_YOSHI_COLUMN_GAP_PERCENT = 40

/**
 * Where each genkō yōshi square has a strip of its own for furigana: none, above it (for
 * horizontal writing) or right of it (for vertical writing).
 */
export const GENKO_YOSHI_FURIGANA = ['none', 'top', 'right'] as const
export type GenkoYoshiFurigana = (typeof GENKO_YOSHI_FURIGANA)[number]

/** How many furigana strips span a genkō yōshi square's side: a strip is a third of it. */
export const GENKO_YOSHI_FURIGANA_DIVISOR = 3

/**
 * Which way genkō yōshi is written: down columns of squares, a blank between the columns, or along
 * rows of squares, a blank between the rows.
 */
export const GENKO_YOSHI_DIRECTIONS = ['vertical', 'horizontal'] as const
export type GenkoYoshiDirection = (typeof GENKO_YOSHI_DIRECTIONS)[number]

/**
 * Where the grid of squares sits across the page inside its margins, the space left by the whole
 * squares that fit going on the other side, or on both.
 */
export const FILL_ALIGNMENTS = ['left', 'center', 'right'] as const
export type FillAlignment = (typeof FILL_ALIGNMENTS)[number]

/** A day's header: its heading, the details after its subheading, and its weekend color. */
export interface DailyHeader {
	/** Whether the heading is the weekday ("Thursday") or the date ("1 January 2026"). */
	heading: DayPageHeading
	/** The heading's font size, in pt; the subheading keeps its own. */
	fontSize: number
	/** Whether the details line shows the ISO week ("Week 1"). */
	showWeek: boolean
	/** Whether the details line shows the day of the year ("Day 1 / 365"). */
	showDayOfYear: boolean
	/** Whether the heading is drawn in the weekend color on Saturdays and Sundays. */
	highlightWeekendDays: boolean
}

/** Genkō yōshi, the `genkoYoshi` fill: its squares, the way it is written, its furigana and guides. */
export interface GenkoYoshiOptions {
	/** The side of a square, in mm. */
	squareSize: number
	/** Whether the squares make columns or rows, the blank between them. */
	direction: GenkoYoshiDirection
	/** Where each square has a furigana strip. */
	furigana: GenkoYoshiFurigana
	/** Whether dotted guide lines divide each square in half, across and down. */
	guides: boolean
}

/** What fills a day's page, or two. */
export interface DailyContent {
	/**
	 * Whether each day takes two pages: the second, without a header, continues the ruled lines or
	 * holds the second half of the schedule's hours.
	 */
	twoPages: boolean
	/** What fills the page under its header; the schedule's hours come from `schedule`. */
	fill: DayPageFill
	/** The distance between ruled lines, in mm; only used when `fill` is `ruled`. */
	ruledLineSpacing: number
	/**
	 * The side of a square, in mm, the dots marking the corners of such squares; only used when
	 * `fill` is `squares` or `dots`.
	 */
	squareSize: number
	/**
	 * Where the grid of squares, of dots or of genkō yōshi columns sits across the page; only used
	 * when `fill` is `squares`, `dots` or `genkoYoshi`.
	 */
	fillAlignment: FillAlignment
	/** Only used when `fill` is `genkoYoshi`. */
	genkoYoshi: GenkoYoshiOptions
	/** Only used when `fill` is `hours`. */
	schedule: HourSchedule
}

export interface DailyOptions extends CommonOptions {
	header: DailyHeader
	/** The day's month, drawn small in the top right corner with the day marked. */
	miniMonth: MiniMonthOptions
	content: DailyContent
	/** The empty footer at the bottom of each sheet, under the fill. */
	footer: PageFooter
}

const HEADER_VALIDATORS: Validators<DailyHeader> = {
	heading: oneOf(DAY_PAGE_HEADINGS),
	fontSize: isHeadingFontSize,
	showWeek: isBoolean,
	showDayOfYear: isBoolean,
	highlightWeekendDays: isBoolean,
}

const CONTENT_VALIDATORS: Validators<DailyContent> = {
	twoPages: isBoolean,
	fill: oneOf(DAY_PAGE_FILLS),
	ruledLineSpacing: isRuledLineSpacing,
	squareSize: isSquareSize,
	fillAlignment: oneOf(FILL_ALIGNMENTS),
	genkoYoshi: {
		squareSize: isGenkoYoshiSquareSize,
		direction: oneOf(GENKO_YOSHI_DIRECTIONS),
		furigana: oneOf(GENKO_YOSHI_FURIGANA),
		guides: isBoolean,
	},
	schedule: SCHEDULE_VALIDATORS,
}

export const DAILY_SPEC: LayoutSpec<DailyOptions> = {
	// A tall schedule fits portrait.
	defaults: () => {
		const { page, ...common } = commonDefaults()
		// The groups in sidebar order, which files keep: the page last.
		return {
			...common,
			header: {
				heading: 'date',
				fontSize: 24,
				showWeek: true,
				showDayOfYear: true,
				highlightWeekendDays: true,
			},
			miniMonth: miniMonthDefaults(),
			content: {
				twoPages: false,
				fill: 'hours',
				ruledLineSpacing: 8,
				// A math notebook's squares.
				squareSize: 5,
				fillAlignment: 'center',
				genkoYoshi: {
					// 1.2 cm, a common size of manuscript paper.
					squareSize: 12,
					direction: 'vertical',
					furigana: 'none',
					guides: false,
				},
				schedule: scheduleDefaults(),
			},
			footer: footerDefaults(),
			page,
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
	migrations: DAILY_MIGRATIONS,
}
