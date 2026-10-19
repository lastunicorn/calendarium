import { type CommonConfig, commonDefaults } from '../CalendarConfig'
import { COMMON_VALIDATORS, isBoolean, oneOf } from '../validators'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from './hours'
import type { LayoutSpec } from './LayoutSpec'

/** What fills a `day-per-page` page under its header: an hourly schedule or plain ruled lines. */
export const DAY_PAGE_LINES = ['hours', 'ruled'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

/** What a `day-per-page` page's heading shows; the other one goes in the subheading. */
export const DAY_PAGE_TITLES = ['weekday', 'date'] as const
export type DayPageTitle = (typeof DAY_PAGE_TITLES)[number]

export interface DayPerPageConfig extends CommonConfig, HourSchedule {
	/** Whether the heading is the weekday ("Thursday") or the date ("1 January 2026"). */
	dayPageTitle: DayPageTitle
	/** What fills the page under its header; the schedule's hours come from `HourSchedule`. */
	dayPageLines: DayPageLines
	/**
	 * Whether each day takes two pages: the second, without a header, continues the ruled lines or
	 * holds the second half of the schedule's hours.
	 */
	twoPagesPerDay: boolean
	/** Whether the day's month is drawn small in the top right corner, with the day marked. */
	showMiniMonth: boolean
	/** Whether the header's details line shows the ISO week ("Week 1"). */
	showHeaderWeek: boolean
	/** Whether the header's details line shows the day of the year ("Day 1 / 365"). */
	showHeaderDayOfYear: boolean
}

export const DAY_PER_PAGE_SPEC: LayoutSpec<DayPerPageConfig> = {
	// A tall schedule fits portrait.
	defaults: () => ({
		...commonDefaults(),
		showWeekNumbers: true,
		dayPageTitle: 'weekday',
		dayPageLines: 'hours',
		twoPagesPerDay: false,
		...scheduleDefaults(),
		showMiniMonth: true,
		showHeaderWeek: true,
		showHeaderDayOfYear: true,
	}),
	validators: {
		...COMMON_VALIDATORS,
		dayPageTitle: oneOf(DAY_PAGE_TITLES),
		dayPageLines: oneOf(DAY_PAGE_LINES),
		twoPagesPerDay: isBoolean,
		...SCHEDULE_VALIDATORS,
		showMiniMonth: isBoolean,
		showHeaderWeek: isBoolean,
		showHeaderDayOfYear: isBoolean,
	},
	normalize: orderHours,
}
