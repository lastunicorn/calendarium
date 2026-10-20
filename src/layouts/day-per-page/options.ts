import { isBoolean, oneOf } from '../../core/validation'
import { COMMON_VALIDATORS, type CommonConfig, commonDefaults } from '../common'
import type { LayoutSpec } from '../LayoutSpec'
import { MINI_MONTH_VALIDATORS, type MiniMonthOptions, miniMonthDefaults } from '../monthGrid'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from '../schedule'

/** What fills a `day-per-page` page under its header: an hourly schedule or plain ruled lines. */
export const DAY_PAGE_LINES = ['hours', 'ruled'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

/** What a `day-per-page` page's heading shows; the other one goes in the subheading. */
export const DAY_PAGE_TITLES = ['weekday', 'date'] as const
export type DayPageTitle = (typeof DAY_PAGE_TITLES)[number]

/** Bounds of the distance between ruled lines, in mm. */
export const MIN_RULED_LINE_SPACING = 4
export const MAX_RULED_LINE_SPACING = 20

/** A distance between ruled lines, in mm, from `MIN_RULED_LINE_SPACING` to `MAX_RULED_LINE_SPACING`. */
export function isRuledLineSpacing(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_RULED_LINE_SPACING &&
		value <= MAX_RULED_LINE_SPACING
	)
}

export interface DayPerPageConfig extends CommonConfig, HourSchedule {
	/** Whether the heading is the weekday ("Thursday") or the date ("1 January 2026"). */
	dayPageTitle: DayPageTitle
	/** What fills the page under its header; the schedule's hours come from `HourSchedule`. */
	dayPageLines: DayPageLines
	/** The distance between ruled lines, in mm; only used when `dayPageLines` is `ruled`. */
	ruledLineSpacing: number
	/**
	 * Whether each day takes two pages: the second, without a header, continues the ruled lines or
	 * holds the second half of the schedule's hours.
	 */
	twoPagesPerDay: boolean
	/** Whether the heading is drawn in the weekend color on Saturdays and Sundays. */
	highlightWeekendDays: boolean
	/** The day's month, drawn small in the top right corner with the day marked. */
	miniMonth: MiniMonthOptions
	/** Whether the header's details line shows the ISO week ("Week 1"). */
	showHeaderWeek: boolean
	/** Whether the header's details line shows the day of the year ("Day 1 / 365"). */
	showHeaderDayOfYear: boolean
}

export const DAY_PER_PAGE_SPEC: LayoutSpec<DayPerPageConfig> = {
	// A tall schedule fits portrait.
	defaults: () => ({
		...commonDefaults(),
		dayPageTitle: 'weekday',
		dayPageLines: 'hours',
		ruledLineSpacing: 8,
		twoPagesPerDay: false,
		...scheduleDefaults(),
		highlightWeekendDays: true,
		miniMonth: miniMonthDefaults(),
		showHeaderWeek: true,
		showHeaderDayOfYear: true,
	}),
	validators: {
		...COMMON_VALIDATORS,
		dayPageTitle: oneOf(DAY_PAGE_TITLES),
		dayPageLines: oneOf(DAY_PAGE_LINES),
		ruledLineSpacing: isRuledLineSpacing,
		twoPagesPerDay: isBoolean,
		...SCHEDULE_VALIDATORS,
		highlightWeekendDays: isBoolean,
		miniMonth: MINI_MONTH_VALIDATORS,
		showHeaderWeek: isBoolean,
		showHeaderDayOfYear: isBoolean,
	},
	normalize: orderHours,
}
