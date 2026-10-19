/** Day of the week a calendar week starts on, as in `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

export function isWeekStart(value: unknown): value is WeekStart {
	return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6
}

/**
 * A calendar date: no time of day, no time zone. What a calendar cell stands for, unlike a
 * `Date`, which is an instant. When `Temporal.PlainDate` is available in the print target,
 * `plainDate` and `utcDate` are the only places to change.
 */
export interface PlainDate {
	year: number
	/** 0 = January … 11 = December. */
	month: number
	/** Day of the month, 1–31. */
	day: number
	/** Day of the week, as in `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
	weekday: number
	/** `YYYY-MM-DD`, unique per date: a React key. */
	key: string
}

export interface CalendarDay extends PlainDate {
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

/**
 * The `Date` at UTC midnight (plus `hours`) of a calendar date: the only place a `Date` is built.
 * UTC has no DST, and `setUTCFullYear` takes years 0–99 as written, where the `Date` constructor
 * reads them as 1900–1999. Out-of-range components roll over: day 0 is the previous month's last
 * day. Format it in UTC, as `dateFormatter` does.
 */
export function utcDate(year: number, month: number, day: number, hours = 0): Date {
	const date = new Date(0)
	date.setUTCFullYear(year, month, day)
	date.setUTCHours(hours)
	return date
}

/** The calendar date of `year`, `month`, `day`, rolling over out-of-range components like `utcDate`. */
export function plainDate(year: number, month: number, day: number): PlainDate {
	const date = utcDate(year, month, day)
	const fullYear = date.getUTCFullYear()
	const monthIndex = date.getUTCMonth()
	const dayOfMonth = date.getUTCDate()
	return {
		year: fullYear,
		month: monthIndex,
		day: dayOfMonth,
		weekday: date.getUTCDay(),
		key: `${pad(fullYear, 4)}-${pad(monthIndex + 1, 2)}-${pad(dayOfMonth, 2)}`,
	}
}

function pad(value: number, length: number): string {
	return String(value).padStart(length, '0')
}

export function daysInMonth(year: number, month: number): number {
	return plainDate(year, month + 1, 0).day
}

export function isWeekend(date: PlainDate): boolean {
	return date.weekday === 0 || date.weekday === 6
}

/** ISO 8601 week number (weeks start on Monday; week 1 contains the year's first Thursday). */
export function isoWeek(date: PlainDate): number {
	// The Thursday of the date's ISO week decides which year the week belongs to.
	const thursday = plainDate(date.year, date.month, date.day + 3 - ((date.weekday + 6) % 7))
	const january4 = plainDate(thursday.year, 0, 4)
	const firstThursday = plainDate(thursday.year, 0, 4 + 3 - ((january4.weekday + 6) % 7))
	return 1 + (dayNumber(thursday) - dayNumber(firstThursday)) / 7
}

/** Position of `date` in its year: 1 for January 1 … 365 or 366 for December 31. */
export function dayOfYear(date: PlainDate): number {
	return dayNumber(date) - dayNumber(plainDate(date.year, 0, 1)) + 1
}

/** Days since the epoch. */
function dayNumber(date: PlainDate): number {
	return utcDate(date.year, date.month, date.day).getTime() / 86_400_000
}

/**
 * ISO week number for a calendar row. A row that does not start on Monday spans two ISO weeks;
 * it gets the number of the week holding most of its days, i.e. the one containing its Thursday.
 */
export function weekNumber(week: CalendarDay[]): number {
	const thursday = week.find((day) => day.weekday === 4) ?? week[0]
	return isoWeek(thursday)
}

export function buildMonth(year: number, month: number, weekStart: WeekStart): CalendarMonth {
	const leadingDays = (plainDate(year, month, 1).weekday - weekStart + 7) % 7
	const weeks: CalendarDay[][] = []

	for (let week = 0; week < WEEKS_PER_MONTH; week++) {
		const days: CalendarDay[] = []
		for (let column = 0; column < 7; column++) {
			const date = plainDate(year, month, 1 - leadingDays + week * 7 + column)
			days.push({ ...date, inMonth: date.month === month, isWeekend: isWeekend(date) })
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

/** Every day of the year in order, taken from `buildYear`'s months without adjacent-month days. */
export function daysOfYear(months: CalendarMonth[]): CalendarDay[] {
	return months.flatMap((month) => month.weeks.flat().filter((day) => day.inMonth))
}
