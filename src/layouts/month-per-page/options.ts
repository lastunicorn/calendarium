import { WEEKDAY_FORMATS } from '../../core/locale'
import { margins } from '../../core/paper'
import { isBoolean, isString, oneOf, type Validators } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonConfig, commonDefaults } from '../common'
import { HEADING_ALIGNS, type HeadingAlign } from '../heading'
import { type LayoutSpec, unchanged } from '../LayoutSpec'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from '../monthGrid'

/** The previous and the next month, drawn small at the top left and top right of each page. */
export interface AdjacentMonthsOptions extends MonthGridOptions {
	showPreviousMonth: boolean
	showNextMonth: boolean
	/** Whether each one's title names its year after the month, or the month alone. */
	showYear: boolean
}

/** Both adjacent months shown, titled with their month and year, without week numbers. */
function adjacentMonthsDefaults(): AdjacentMonthsOptions {
	return {
		showPreviousMonth: true,
		showNextMonth: true,
		showYear: true,
		...monthGridDefaults(),
	}
}

const ADJACENT_MONTHS_VALIDATORS: Validators<AdjacentMonthsOptions> = {
	showPreviousMonth: isBoolean,
	showNextMonth: isBoolean,
	showYear: isBoolean,
	...MONTH_GRID_VALIDATORS,
}

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

export interface MonthPerPageConfig extends CommonConfig, MonthGridOptions {
	/**
	 * Shown above the grid on every page, the month and year then below it; when empty, the month
	 * and year are the heading.
	 */
	title: string
	/**
	 * Where the heading sits above the grid. Nothing is ever beside it, so unlike the week's
	 * `headingAlignment` it has no `auto`.
	 */
	monthHeadingAlignment: HeadingAlign
	/** Whether the grid's grayed days of the previous and next month show their numbers. */
	showAdjacentMonthDays: boolean
	/** Whether the grid's cells are ruled, or only their contents are drawn. */
	showGridLines: boolean
	/** The size of the weekday names above the grid's columns, in pt. */
	weekdayFontSize: number
	/** The size of each day's number in the grid, in pt; its events' names keep their own. */
	dayNumberFontSize: number
	dayNumberHorizontalAlignment: DayNumberHorizontalAlignment
	dayNumberVerticalAlignment: DayNumberVerticalAlignment
	adjacentMonths: AdjacentMonthsOptions
}

export const MONTH_PER_PAGE_SPEC: LayoutSpec<MonthPerPageConfig> = {
	// Large writing cells fit landscape, with room for full weekday names.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			...monthGridDefaults(),
			weekdayFormat: 'full',
			title: '',
			highlightWeekends: 'columns',
			monthHeadingAlignment: 'center',
			showAdjacentMonthDays: false,
			showGridLines: true,
			weekdayFontSize: 9,
			dayNumberFontSize: 14,
			dayNumberHorizontalAlignment: 'left',
			dayNumberVerticalAlignment: 'top',
			adjacentMonths: adjacentMonthsDefaults(),
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		...MONTH_GRID_VALIDATORS,
		// A page-wide grid has room for full weekday names, unlike a small one.
		weekdayFormat: oneOf(WEEKDAY_FORMATS),
		title: isString,
		monthHeadingAlignment: oneOf(HEADING_ALIGNS),
		showAdjacentMonthDays: isBoolean,
		showGridLines: isBoolean,
		weekdayFontSize: isWeekdayFontSize,
		dayNumberFontSize: isDayNumberFontSize,
		dayNumberHorizontalAlignment: oneOf(DAY_NUMBER_HORIZONTAL_ALIGNMENTS),
		dayNumberVerticalAlignment: oneOf(DAY_NUMBER_VERTICAL_ALIGNMENTS),
		adjacentMonths: ADJACENT_MONTHS_VALIDATORS,
	},
	normalize: unchanged,
}
