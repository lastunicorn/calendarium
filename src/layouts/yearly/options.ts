import { isString, oneOf, type Validators } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonOptions, commonDefaults, normalizeCommon } from '../common'
import { isHeadingFontSize } from '../heading'
import type { LayoutSpec } from '../LayoutSpec'
import { YEARLY_MIGRATIONS } from './migrations'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from '../monthGrid'

/** How large the 12 months' text is drawn, each month filling its share of the page either way. */
export const MONTH_SIZES = ['small', 'medium', 'large'] as const
export type MonthSize = (typeof MONTH_SIZES)[number]

/** The heading printed above the months. */
export interface YearlyHeader {
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
	/** The heading's font size, in pt; the subtitle keeps its own. */
	fontSize: number
}

/** The 12 months: their size and their grid. */
export interface YearlyContent extends MonthGridOptions {
	monthSize: MonthSize
}

export interface YearlyOptions extends CommonOptions {
	header: YearlyHeader
	content: YearlyContent
}

const HEADER_VALIDATORS: Validators<YearlyHeader> = {
	title: isString,
	subtitle: isString,
	fontSize: isHeadingFontSize,
}

const CONTENT_VALIDATORS: Validators<YearlyContent> = {
	monthSize: oneOf(MONTH_SIZES),
	...MONTH_GRID_VALIDATORS,
}

export const YEARLY_SPEC: LayoutSpec<YearlyOptions> = {
	// 12 small months fit portrait; one-letter weekdays keep them narrow.
	defaults: () => ({
		...commonDefaults(),
		header: { title: '', subtitle: '', fontSize: 32 },
		content: { monthSize: 'medium', ...monthGridDefaults() },
	}),
	validators: {
		...COMMON_VALIDATORS,
		header: HEADER_VALIDATORS,
		content: CONTENT_VALIDATORS,
	},
	normalize: normalizeCommon,
	migrations: YEARLY_MIGRATIONS,
}
