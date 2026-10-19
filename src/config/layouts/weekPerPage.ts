import { WEEKEND_DISPLAYS, type WeekendDisplay } from '../../core/weekend'
import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS, oneOf } from '../validators'
import { type LayoutSpec, unchanged } from './LayoutSpec'

export interface WeekPerPageConfig extends CommonConfig {
	/** Whether Saturday and Sunday get a cell each, share one, or are left out. */
	weekendDisplay: WeekendDisplay
}

export const WEEK_PER_PAGE_SPEC: LayoutSpec<WeekPerPageConfig> = {
	// Seven columns side by side fit landscape; week numbers show as "Week N" in the heading.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			showWeekNumbers: true,
			weekendDisplay: 'full',
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		weekendDisplay: oneOf(WEEKEND_DISPLAYS),
	},
	normalize: unchanged,
}
