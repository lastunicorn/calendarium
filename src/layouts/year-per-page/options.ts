import { isString } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonConfig, commonDefaults, normalizeCommon } from '../common'
import type { LayoutSpec } from '../LayoutSpec'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from '../monthGrid'

export interface YearPerPageConfig extends CommonConfig, MonthGridOptions {
	/** Shown above the calendar; when empty, the year is shown instead. */
	title: string
	/** Shown below the title; hidden when empty. */
	subtitle: string
}

export const YEAR_PER_PAGE_SPEC: LayoutSpec<YearPerPageConfig> = {
	// 12 small months fit portrait; one-letter weekdays keep them narrow.
	defaults: () => ({ ...commonDefaults(), ...monthGridDefaults(), title: '', subtitle: '' }),
	validators: {
		...COMMON_VALIDATORS,
		...MONTH_GRID_VALIDATORS,
		title: isString,
		subtitle: isString,
	},
	normalize: normalizeCommon,
	migrations: {},
}
