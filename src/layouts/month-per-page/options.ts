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
}

/** Both adjacent months shown, with week numbers, as a mini month on the other layouts. */
function adjacentMonthsDefaults(): AdjacentMonthsOptions {
	return {
		showPreviousMonth: true,
		showNextMonth: true,
		...monthGridDefaults(),
		showWeekNumbers: true,
	}
}

const ADJACENT_MONTHS_VALIDATORS: Validators<AdjacentMonthsOptions> = {
	showPreviousMonth: isBoolean,
	showNextMonth: isBoolean,
	...MONTH_GRID_VALIDATORS,
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
			showWeekNumbers: true,
			monthHeadingAlignment: 'center',
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
		adjacentMonths: ADJACENT_MONTHS_VALIDATORS,
	},
	normalize: unchanged,
}
