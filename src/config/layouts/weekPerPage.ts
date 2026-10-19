import { WEEKEND_DISPLAYS, type WeekendDisplay } from '../../core/weekend'
import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS, oneOf } from '../validators'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from './hours'
import type { LayoutSpec } from './LayoutSpec'

/** What fills each day's cell on a `week-per-page` page under its label: nothing, or an hourly schedule. */
export const WEEK_PAGE_LINES = ['none', 'hours'] as const
export type WeekPageLines = (typeof WEEK_PAGE_LINES)[number]

export interface WeekPerPageConfig extends CommonConfig, HourSchedule {
	/** Whether Saturday and Sunday get a cell each, share one, or are left out. */
	weekendDisplay: WeekendDisplay
	/**
	 * What fills each day's cell; the schedule's hours come from `HourSchedule`. Saturday and
	 * Sunday sharing a cell have no room for one, so only the other days get it.
	 */
	weekPageLines: WeekPageLines
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
			weekPageLines: 'none',
			...scheduleDefaults(),
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		weekendDisplay: oneOf(WEEKEND_DISPLAYS),
		weekPageLines: oneOf(WEEK_PAGE_LINES),
		...SCHEDULE_VALIDATORS,
	},
	normalize: orderHours,
}
