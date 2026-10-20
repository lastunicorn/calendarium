/** A day of the week, as in `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Day of the week a calendar week starts on. */
export type WeekStart = Weekday

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
	weekday: Weekday
	/** `YYYY-MM-DD`, unique per date: a React key. */
	key: string
}

export interface CalendarDay extends PlainDate {
	/** False for leading/trailing days that belong to the previous/next month. */
	inMonth: boolean
	isWeekend: boolean
}

/** A day on a week page, which can reach into the previous or next year. */
export interface WeekDay extends PlainDate {
	/** False for the days of the first and last week that belong to the previous/next year. */
	inYear: boolean
	isWeekend: boolean
}

/** Seven consecutive days of the year's weeks, from the week start (`weeksOfYear`). */
export type Week = WeekDay[]

export interface CalendarMonth {
	year: number
	/** 0 = January … 11 = December. */
	month: number
	/** Always 6 weeks of 7 days, so every month has the same height. */
	weeks: CalendarDay[][]
}

export const WEEKS_PER_MONTH = 6

/** The column of `weekday` in a week starting on `weekStart`: 0 for the week start … 6. */
export function weekdayColumn(weekday: Weekday, weekStart: WeekStart): number {
	return (weekday - weekStart + 7) % 7
}

/** The first full year of the Gregorian calendar, which the printed weekdays and leap days follow. */
export const MIN_YEAR = 1583
export const MAX_YEAR = 9999

export function isYear(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_YEAR && (value as number) <= MAX_YEAR
}

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
		weekday: date.getUTCDay() as Weekday,
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
	const thursday = plainDate(date.year, date.month, date.day + 3 - weekdayColumn(date.weekday, 1))
	const january4 = plainDate(thursday.year, 0, 4)
	const firstThursday = plainDate(thursday.year, 0, 4 + 3 - weekdayColumn(january4.weekday, 1))
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
export function weekNumber(week: PlainDate[]): number {
	const thursday = week.find((day) => day.weekday === 4) ?? week[0]
	return isoWeek(thursday)
}

/**
 * The month (0–11) a week of the year is mostly in: the one holding the most of its days of the
 * year, the earlier on a tie. `days` must hold at least one day of the year.
 */
export function weekMonth(days: WeekDay[]): number {
	const counts = new Map<number, number>()
	for (const day of days) if (day.inYear) counts.set(day.month, (counts.get(day.month) ?? 0) + 1)
	let month = -1
	let most = 0
	// A map keeps insertion order, so months come in order and a tie keeps the earlier one.
	for (const [candidate, count] of counts) {
		if (count > most) {
			month = candidate
			most = count
		}
	}
	return month
}

export function buildMonth(year: number, month: number, weekStart: WeekStart): CalendarMonth {
	const leadingDays = weekdayColumn(plainDate(year, month, 1).weekday, weekStart)
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

/**
 * Every week holding at least one day of `year`, each 7 days from `weekStart`: the first starts on
 * or before January 1, the last ends on or after December 31. 53 weeks, or 54 when a leap year starts on the last day of a week.
 */
export function weeksOfYear(year: number, weekStart: WeekStart): Week[] {
	const leadingDays = weekdayColumn(plainDate(year, 0, 1).weekday, weekStart)
	const weeks: Week[] = []

	for (let first = 1 - leadingDays; plainDate(year, 0, first).year <= year; first += 7) {
		const days: Week = []
		for (let column = 0; column < 7; column++) {
			const date = plainDate(year, 0, first + column)
			days.push({ ...date, inYear: date.year === year, isWeekend: isWeekend(date) })
		}
		weeks.push(days)
	}

	return weeks
}
