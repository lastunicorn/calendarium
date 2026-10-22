import { HOUR_FORMATS, type HourFormat } from '../core/locale'
import { oneOf, type Validators } from '../core/validation'

export const MIN_HOUR = 0
export const MAX_HOUR = 23

/** A whole hour of the day, 0–23. */
export function isHour(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_HOUR && (value as number) <= MAX_HOUR
}

/** The options of an hourly schedule, shared by the layouts that draw one. */
export interface HourSchedule {
	/** Clock of the hour labels on the schedule. */
	hourFormat: HourFormat
	/** First and last rows of the schedule, as hours 0–23; both rows are shown. */
	firstHour: number
	lastHour: number
}

/** The default schedule: a working day, labeled in the language's clock. */
export function scheduleDefaults(): HourSchedule {
	return { hourFormat: 'auto', firstHour: 7, lastHour: 21 }
}

export const SCHEDULE_VALIDATORS: Validators<HourSchedule, keyof HourSchedule> = {
	hourFormat: oneOf(HOUR_FORMATS),
	firstHour: isHour,
	lastHour: isHour,
}

/** The schedule runs from `firstHour` to `lastHour`: a reversed range is put in order. */
export function orderHours<O extends HourSchedule>(options: O): O {
	const { firstHour, lastHour } = options
	return firstHour <= lastHour
		? options
		: { ...options, firstHour: lastHour, lastHour: firstHour }
}
