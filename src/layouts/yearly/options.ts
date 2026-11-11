import { isString, oneOf } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonOptions, commonDefaults, normalizeCommon } from '../common'
import { isHeadingFontSize } from '../heading'
import type { LayoutSpec } from '../LayoutSpec'
import { commonGroups } from '../migrations'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from '../monthGrid'

/** How large the 12 months' text is drawn, each month filling its share of the page either way. */
export const MONTH_SIZES = ['small', 'medium', 'large'] as const
export type MonthSize = (typeof MONTH_SIZES)[number]

export interface YearlyOptions extends CommonOptions, MonthGridOptions {
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
	/** The heading's font size, in pt; the subtitle keeps its own. */
	headingFontSize: number
	monthSize: MonthSize
}

export const YEARLY_SPEC: LayoutSpec<YearlyOptions> = {
	// 12 small months fit portrait; one-letter weekdays keep them narrow.
	defaults: () => ({
		...commonDefaults(),
		...monthGridDefaults(),
		title: '',
		subtitle: '',
		headingFontSize: 32,
		monthSize: 'medium',
	}),
	validators: {
		...COMMON_VALIDATORS,
		...MONTH_GRID_VALIDATORS,
		title: isString,
		subtitle: isString,
		headingFontSize: isHeadingFontSize,
		monthSize: oneOf(MONTH_SIZES),
	},
	normalize: normalizeCommon,
	// 5 to 6: the fields every layout has were grouped (`commonGroups`).
	migrations: { 5: commonGroups },
}
