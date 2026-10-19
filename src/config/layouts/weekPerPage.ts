import { WEEKEND_DISPLAYS, type WeekendDisplay } from '../../core/weekend'
import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import type { Orientation } from '../../core/paper'
import { type CommonConfig, commonDefaults, margins } from '../CalendarConfig'
import { COMMON_VALIDATORS, isBoolean, oneOf } from '../validators'
import { type HourSchedule, orderHours, SCHEDULE_VALIDATORS, scheduleDefaults } from './hours'
import type { LayoutSpec } from './LayoutSpec'

/** What fills each day's cell on a `week-per-page` page under its label: nothing, or an hourly schedule. */
export const WEEK_PAGE_LINES = ['none', 'hours'] as const
export type WeekPageLines = (typeof WEEK_PAGE_LINES)[number]

/**
 * How a `week-per-page` page lays out its days: `vertical` as columns side by side, left to right;
 * `horizontal` as rows stacked top to bottom; `auto` columns on landscape paper or over two pages,
 * rows otherwise.
 */
export const WEEK_DAY_DIRECTIONS = ['auto', 'vertical', 'horizontal'] as const
export type WeekDayDirection = (typeof WEEK_DAY_DIRECTIONS)[number]

/** Whether a week page stacks its days as rows (true) or sets them side by side as columns. */
export function stacksDays(
	direction: WeekDayDirection,
	orientation: Orientation,
	twoPages: boolean,
): boolean {
	if (direction === 'auto') return orientation === 'portrait' && !twoPages
	return direction === 'horizontal'
}

export interface WeekPerPageConfig extends CommonConfig, HourSchedule {
	/** How the weekday name in each day's cell is abbreviated. */
	weekdayFormat: WeekdayFormat
	/** Whether the weekend days of the year get the weekend color; other years' days stay gray. */
	highlightWeekendDays: boolean
	/** Whether the heading shows the week's ISO number ("Week 1"). */
	showHeaderWeek: boolean
	/** Whether Saturday and Sunday get a cell each, share one, or are left out. */
	weekendDisplay: WeekendDisplay
	/**
	 * What fills each day's cell; the schedule's hours come from `HourSchedule`. Saturday and
	 * Sunday sharing a cell have no room for one, so only the other days get it; days of
	 * the previous and next year never do.
	 */
	weekPageLines: WeekPageLines
	/**
	 * Whether each week takes two pages: its first three days on the first, under a heading set
	 * to the left, and the rest on the second, which leaves the heading's space empty.
	 */
	twoPagesPerWeek: boolean
	/** Whether the days are columns or rows (`stacksDays`). */
	weekDayDirection: WeekDayDirection
}

export const WEEK_PER_PAGE_SPEC: LayoutSpec<WeekPerPageConfig> = {
	// Columns side by side fit landscape, with room for three-letter weekdays. The weekend
	// shares a cell, leaving the weekdays room for an hourly schedule.
	defaults: () => {
		const common = commonDefaults()
		return {
			...common,
			weekdayFormat: 'short',
			highlightWeekendDays: true,
			showHeaderWeek: true,
			weekendDisplay: 'reduced',
			weekPageLines: 'hours',
			twoPagesPerWeek: false,
			weekDayDirection: 'auto',
			...scheduleDefaults(),
			page: { ...common.page, orientation: 'landscape', margins: margins(10) },
		}
	},
	validators: {
		...COMMON_VALIDATORS,
		weekdayFormat: oneOf(WEEKDAY_FORMATS),
		highlightWeekendDays: isBoolean,
		showHeaderWeek: isBoolean,
		weekendDisplay: oneOf(WEEKEND_DISPLAYS),
		weekPageLines: oneOf(WEEK_PAGE_LINES),
		twoPagesPerWeek: isBoolean,
		weekDayDirection: oneOf(WEEK_DAY_DIRECTIONS),
		...SCHEDULE_VALIDATORS,
	},
	normalize: orderHours,
}
