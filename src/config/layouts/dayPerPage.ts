import { HOUR_FORMATS, type HourFormat } from '../../core/locale'
import { type CommonConfig, commonDefaults } from '../CalendarConfig'
import { COMMON_VALIDATORS, isBoolean, oneOf } from '../validators'
import type { LayoutSpec } from './LayoutSpec'

/** What fills a `day-per-page` page under its header: an hourly schedule or plain ruled lines. */
export const DAY_PAGE_LINES = ['hours', 'ruled'] as const
export type DayPageLines = (typeof DAY_PAGE_LINES)[number]

export const MIN_HOUR = 0
export const MAX_HOUR = 23

/** A whole hour of the day, 0–23. */
export function isHour(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_HOUR && (value as number) <= MAX_HOUR
}

export interface DayPerPageConfig extends CommonConfig {
	/** What fills the page under its header. */
	dayPageLines: DayPageLines
	/** Clock of the hour labels on the schedule. */
	hourFormat: HourFormat
	/** First and last rows of the schedule, as hours 0–23; both rows are shown. */
	firstHour: number
	lastHour: number
	/** Whether the day's month is drawn small in the top right corner, with the day marked. */
	showMiniMonth: boolean
}

export const DAY_PER_PAGE_SPEC: LayoutSpec<DayPerPageConfig> = {
	// A tall schedule fits portrait; week numbers show as "Week N" in the heading.
	defaults: () => ({
		...commonDefaults(),
		showWeekNumbers: true,
		dayPageLines: 'hours',
		hourFormat: 'auto',
		firstHour: 7,
		lastHour: 21,
		showMiniMonth: true,
	}),
	validators: {
		...COMMON_VALIDATORS,
		dayPageLines: oneOf(DAY_PAGE_LINES),
		hourFormat: oneOf(HOUR_FORMATS),
		firstHour: isHour,
		lastHour: isHour,
		showMiniMonth: isBoolean,
	},
	// The schedule runs from `firstHour` to `lastHour`: a reversed range is put in order.
	normalize: (config) => {
		const { firstHour, lastHour } = config
		return firstHour <= lastHour
			? config
			: { ...config, firstHour: lastHour, lastHour: firstHour }
	},
}
