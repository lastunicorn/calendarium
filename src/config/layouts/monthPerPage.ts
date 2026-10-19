import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS } from '../validators'
import { type LayoutSpec, unchanged } from './LayoutSpec'

export type MonthPerPageConfig = CommonConfig

export const MONTH_PER_PAGE_SPEC: LayoutSpec<MonthPerPageConfig> = {
	// Large writing cells fit landscape, with room for three-letter weekdays.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			highlightWeekends: 'columns',
			showWeekNumbers: true,
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: COMMON_VALIDATORS,
	normalize: unchanged,
}
