/** Day of the week a calendar week starts on, as in `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

export function isWeekStart(value: unknown): value is WeekStart {
	return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6
}

export interface CalendarDay {
	date: Date
	/** Day of the month, 1–31. */
	day: number
	/** False for leading/trailing days that belong to the previous/next month. */
	inMonth: boolean
	isWeekend: boolean
}

export interface CalendarMonth {
	year: number
	/** 0 = January … 11 = December. */
	month: number
	/** Always 6 weeks of 7 days, so every month has the same height. */
	weeks: CalendarDay[][]
}

export const WEEKS_PER_MONTH = 6

export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

export function isWeekend(date: Date): boolean {
	const weekday = date.getDay()
	return weekday === 0 || weekday === 6
}

/** ISO 8601 week number (weeks start on Monday; week 1 contains the year's first Thursday). */
export function isoWeek(date: Date): number {
	// The Thursday of the date's ISO week decides which year the week belongs to.
	const thursday = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() + 3 - ((date.getDay() + 6) % 7),
	)
	const firstThursday = new Date(thursday.getFullYear(), 0, 4)
	firstThursday.setDate(4 - ((firstThursday.getDay() + 6) % 7) + 3)
	return 1 + Math.round((dayNumber(thursday) - dayNumber(firstThursday)) / 7)
}

/** Days since the epoch, ignoring the time of day and DST. */
function dayNumber(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
}

/**
 * ISO week number for a calendar row. A row that does not start on Monday spans two ISO weeks;
 * it gets the number of the week holding most of its days, i.e. the one containing its Thursday.
 */
export function weekNumber(week: CalendarDay[]): number {
	const thursday = week.find((day) => day.date.getDay() === 4) ?? week[0]
	return isoWeek(thursday.date)
}

export function buildMonth(year: number, month: number, weekStart: WeekStart): CalendarMonth {
	const first = new Date(year, month, 1)
	const leadingDays = (first.getDay() - weekStart + 7) % 7
	const weeks: CalendarDay[][] = []

	for (let week = 0; week < WEEKS_PER_MONTH; week++) {
		const days: CalendarDay[] = []
		for (let weekday = 0; weekday < 7; weekday++) {
			// Building dates from components (not by adding ms) keeps DST changes harmless.
			const date = new Date(year, month, 1 - leadingDays + week * 7 + weekday)
			days.push({
				date,
				day: date.getDate(),
				inMonth: date.getMonth() === month,
				isWeekend: isWeekend(date),
			})
		}
		weeks.push(days)
	}

	return { year, month, weeks }
}

/**
 * The rows of `month` holding at least one of its days: 4–6 rows, as on a wall calendar.
 * `buildMonth` itself keeps 6 so grids of several months line up.
 */
export function visibleWeeks(month: CalendarMonth): CalendarDay[][] {
	return month.weeks.filter((week) => week.some((day) => day.inMonth))
}

export function buildYear(year: number, weekStart: WeekStart): CalendarMonth[] {
	return Array.from({ length: 12 }, (_, month) => buildMonth(year, month, weekStart))
}
