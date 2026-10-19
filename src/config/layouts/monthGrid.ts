import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../../core/weekend'
import { isBoolean, oneOf, type Validators } from '../validators'

/** The options of a month drawn as a grid of weeks, shared by the layouts that draw one. */
export interface MonthGridOptions {
	/** How the weekday names above the columns are abbreviated. */
	weekdayFormat: WeekdayFormat
	highlightWeekends: WeekendHighlight
	/** ISO week numbers in a column before each week. */
	showWeekNumbers: boolean
}

/** The default grid: one-letter weekdays, the month's own weekend days highlighted. */
export function monthGridDefaults(): MonthGridOptions {
	return {
		weekdayFormat: 'narrow',
		highlightWeekends: 'days',
		showWeekNumbers: false,
	}
}

export const MONTH_GRID_VALIDATORS: Validators<MonthGridOptions> = {
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}

/** A month drawn small beside a page's main content, for context; it can be left out. */
export interface MiniMonthOptions extends MonthGridOptions {
	show: boolean
}

/** The default mini month: shown, with week numbers. */
export function miniMonthDefaults(): MiniMonthOptions {
	return { show: true, ...monthGridDefaults(), showWeekNumbers: true }
}

export const MINI_MONTH_VALIDATORS: Validators<MiniMonthOptions> = {
	show: isBoolean,
	...MONTH_GRID_VALIDATORS,
}
