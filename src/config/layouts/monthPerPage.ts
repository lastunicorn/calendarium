import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS } from '../validators'
import { type LayoutSpec, unchanged } from './LayoutSpec'
import { MONTH_GRID_VALIDATORS, type MonthGridOptions, monthGridDefaults } from './monthGrid'

export interface MonthPerPageConfig extends CommonConfig, MonthGridOptions {}

export const MONTH_PER_PAGE_SPEC: LayoutSpec<MonthPerPageConfig> = {
	// Large writing cells fit landscape, with room for three-letter weekdays.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			...monthGridDefaults(),
			weekdayFormat: 'short',
			highlightWeekends: 'columns',
			showWeekNumbers: true,
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: { ...COMMON_VALIDATORS, ...MONTH_GRID_VALIDATORS },
	normalize: unchanged,
}
