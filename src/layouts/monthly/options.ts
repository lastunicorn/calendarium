import { WEEKDAY_FORMATS } from '../../core/locale'
import { margins } from '../../core/paper'
import { isBoolean, isString, oneOf, type Validators } from '../../core/validation'
import { COMMON_VALIDATORS, commonDefaults, normalizeCommon, type CommonOptions } from '../common'
import { HEADING_ALIGNS, isHeadingFontSize, type HeadingAlign } from '../heading'
import type { LayoutSpec } from '../LayoutSpec'
import {
	MINI_MONTH_STYLE_VALIDATORS,
	miniMonthStyleDefaults,
	MONTH_GRID_VALIDATORS,
	monthGridDefaults,
	type MiniMonthStyle,
	type MonthGridOptions,
} from '../monthGrid'
import { MONTHLY_MIGRATIONS } from './migrations'

/** Where a day's number sits across its grid cell, its events' names following it. */
export const DAY_NUMBER_HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right'] as const
export type DayNumberHorizontalAlignment = (typeof DAY_NUMBER_HORIZONTAL_ALIGNMENTS)[number]

/**
 * Where a day's number sits down its grid cell: its events' names stay below it at the top and
 * middle, above it at the bottom.
 */
export const DAY_NUMBER_VERTICAL_ALIGNMENTS = ['top', 'center', 'bottom'] as const
export type DayNumberVerticalAlignment = (typeof DAY_NUMBER_VERTICAL_ALIGNMENTS)[number]

/** Bounds of a grid day's number size, in pt. */
export const MIN_DAY_NUMBER_FONT_SIZE = 8
export const MAX_DAY_NUMBER_FONT_SIZE = 36

/** A day number's font size, in pt, from `MIN_DAY_NUMBER_FONT_SIZE` to `MAX_DAY_NUMBER_FONT_SIZE`. */
export function isDayNumberFontSize(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_DAY_NUMBER_FONT_SIZE &&
		value <= MAX_DAY_NUMBER_FONT_SIZE
	)
}

/** Bounds of the grid's weekday names' size, in pt. */
export const MIN_WEEKDAY_FONT_SIZE = 6
export const MAX_WEEKDAY_FONT_SIZE = 24

/** A weekday name's font size, in pt, from `MIN_WEEKDAY_FONT_SIZE` to `MAX_WEEKDAY_FONT_SIZE`. */
export function isWeekdayFontSize(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_WEEKDAY_FONT_SIZE &&
		value <= MAX_WEEKDAY_FONT_SIZE
	)
}

/** The heading above the grid on every page. */
export interface MonthlyHeader {
	/**
	 * Shown above the grid on every page, the month and year then below it; when empty, the month
	 * and year are the heading.
	 */
	title: string
	/**
	 * Where the heading sits above the grid. Nothing is ever beside it, so unlike the week's
	 * header `alignment` it has no `auto`.
	 */
	alignment: HeadingAlign
	/** The heading's font size, in pt; the subheading keeps its own. */
	fontSize: number
}

/** The previous and the next month, drawn small at the top left and top right of each page. */
export interface MonthlyMiniMonth extends MiniMonthStyle {
	showPreviousMonth: boolean
	showNextMonth: boolean
}

/** Each day's number in the grid: its size and where it sits in its cell. */
export interface DayNumber {
	/** The size of the number, in pt; its events' names keep their own. */
	fontSize: number
	horizontalAlignment: DayNumberHorizontalAlignment
	verticalAlignment: DayNumberVerticalAlignment
}

/** The month's grid of large writing cells. */
export interface MonthlyContent extends MonthGridOptions {
	/** Whether the grid's grayed days of the previous and next month show their numbers. */
	showAdjacentMonthDays: boolean
	/** Whether the grid's cells are ruled, or only their contents are drawn. */
	showGridLines: boolean
	/** The size of the weekday names above the grid's columns, in pt. */
	weekdayFontSize: number
	dayNumber: DayNumber
}

export interface MonthlyOptions extends CommonOptions {
	header: MonthlyHeader
	miniMonth: MonthlyMiniMonth
	content: MonthlyContent
}

const HEADER_VALIDATORS: Validators<MonthlyHeader> = {
	title: isString,
	alignment: oneOf(HEADING_ALIGNS),
	fontSize: isHeadingFontSize,
}

const MINI_MONTH_VALIDATORS: Validators<MonthlyMiniMonth> = {
	showPreviousMonth: isBoolean,
	showNextMonth: isBoolean,
	...MINI_MONTH_STYLE_VALIDATORS,
}

const CONTENT_VALIDATORS: Validators<MonthlyContent> = {
	...MONTH_GRID_VALIDATORS,
	// A page-wide grid has room for full weekday names, unlike a small one.
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	showAdjacentMonthDays: isBoolean,
	showGridLines: isBoolean,
	weekdayFontSize: isWeekdayFontSize,
	dayNumber: {
		fontSize: isDayNumberFontSize,
		horizontalAlignment: oneOf(DAY_NUMBER_HORIZONTAL_ALIGNMENTS),
		verticalAlignment: oneOf(DAY_NUMBER_VERTICAL_ALIGNMENTS),
	},
}

export const MONTHLY_SPEC: LayoutSpec<MonthlyOptions> = {
	// Large writing cells fit landscape, with room for full weekday names.
	defaults: () => {
		const { page, ...common } = commonDefaults()
		// The groups in sidebar order, which files keep: the page last.
		return {
			...common,
			header: { title: '', alignment: 'center', fontSize: 24 },
			// Both adjacent months shown, titled with their month and year, without week numbers.
			miniMonth: {
				showPreviousMonth: true,
				showNextMonth: true,
				...miniMonthStyleDefaults(),
				showYear: true,
			},
			content: {
				...monthGridDefaults(),
				weekdayFormat: 'full',
				highlightWeekends: 'columns',
				showAdjacentMonthDays: false,
				showGridLines: true,
				weekdayFontSize: 9,
				dayNumber: { fontSize: 14, horizontalAlignment: 'left', verticalAlignment: 'top' },
			},
			page: { ...page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		header: HEADER_VALIDATORS,
		miniMonth: MINI_MONTH_VALIDATORS,
		content: CONTENT_VALIDATORS,
	},
	normalize: normalizeCommon,
	migrations: MONTHLY_MIGRATIONS,
}
