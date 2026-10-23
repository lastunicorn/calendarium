import { isString, oneOf } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonOptions, commonDefaults, normalizeCommon } from '../common'
import type { LayoutSpec } from '../LayoutSpec'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from '../monthGrid'

/** How large the 12 months' text is drawn, each month filling its share of the page either way. */
export const MONTH_SIZES = ['small', 'medium', 'large'] as const
export type MonthSize = (typeof MONTH_SIZES)[number]

export interface YearPerPageOptions extends CommonOptions, MonthGridOptions {
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
	monthSize: MonthSize
}

export const YEAR_PER_PAGE_SPEC: LayoutSpec<YearPerPageOptions> = {
	// 12 small months fit portrait; one-letter weekdays keep them narrow.
	defaults: () => ({
		...commonDefaults(),
		...monthGridDefaults(),
		title: '',
		subtitle: '',
		monthSize: 'medium',
	}),
	validators: {
		...COMMON_VALIDATORS,
		...MONTH_GRID_VALIDATORS,
		title: isString,
		subtitle: isString,
		monthSize: oneOf(MONTH_SIZES),
	},
	normalize: normalizeCommon,
	migrations: {},
}
