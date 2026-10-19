import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS } from '../validators'
import { type LayoutSpec, unchanged } from './LayoutSpec'

export type WeekPerPageConfig = CommonConfig

export const WEEK_PER_PAGE_SPEC: LayoutSpec<WeekPerPageConfig> = {
	// Seven columns side by side fit landscape; week numbers show as "Week N" in the heading.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			showWeekNumbers: true,
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: COMMON_VALIDATORS,
	normalize: unchanged,
}
