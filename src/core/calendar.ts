/** Day of the week a calendar week starts on: 0 = Sunday, 1 = Monday. */
export type WeekStart = 0 | 1

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

export function buildYear(year: number, weekStart: WeekStart): CalendarMonth[] {
	return Array.from({ length: 12 }, (_, month) => buildMonth(year, month, weekStart))
}
