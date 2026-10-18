import { describe, expect, it } from 'vitest'
import { buildMonth, buildYear, daysInMonth, isLeapYear, WEEKS_PER_MONTH } from './calendar'

function inMonthDays(year: number, month: number, weekStart: 0 | 1) {
	return buildMonth(year, month, weekStart)
		.weeks.flat()
		.filter((day) => day.inMonth)
}

describe('isLeapYear', () => {
	it('follows the Gregorian rules', () => {
		expect(isLeapYear(2024)).toBe(true)
		expect(isLeapYear(2026)).toBe(false)
		expect(isLeapYear(1900)).toBe(false)
		expect(isLeapYear(2000)).toBe(true)
		expect(isLeapYear(2100)).toBe(false)
	})
})

describe('daysInMonth', () => {
	it('handles February in leap and common years', () => {
		expect(daysInMonth(2024, 1)).toBe(29)
		expect(daysInMonth(2025, 1)).toBe(28)
		expect(daysInMonth(2100, 1)).toBe(28)
	})

	it('handles 30- and 31-day months', () => {
		expect(daysInMonth(2026, 0)).toBe(31)
		expect(daysInMonth(2026, 3)).toBe(30)
		expect(daysInMonth(2026, 11)).toBe(31)
	})
})

describe('buildMonth', () => {
	it('always has 6 weeks of 7 days', () => {
		for (const weekStart of [0, 1] as const) {
			for (let month = 0; month < 12; month++) {
				const { weeks } = buildMonth(2026, month, weekStart)
				expect(weeks).toHaveLength(WEEKS_PER_MONTH)
				for (const week of weeks) expect(week).toHaveLength(7)
			}
		}
	})

	it('contains every day of the month exactly once, in order', () => {
		const days = inMonthDays(2024, 1, 1)
		expect(days.map((day) => day.day)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1))
	})

	it('offsets the first day according to the week start', () => {
		// 1 January 2026 is a Thursday.
		const monday = buildMonth(2026, 0, 1).weeks[0]
		expect(monday.findIndex((day) => day.inMonth)).toBe(3)
		const sunday = buildMonth(2026, 0, 0).weeks[0]
		expect(sunday.findIndex((day) => day.inMonth)).toBe(4)
	})

	it('starts on the first cell when the month begins on the week start', () => {
		// 1 June 2026 is a Monday; 1 February 2026 is a Sunday.
		expect(buildMonth(2026, 5, 1).weeks[0][0]).toMatchObject({ day: 1, inMonth: true })
		expect(buildMonth(2026, 1, 0).weeks[0][0]).toMatchObject({ day: 1, inMonth: true })
	})

	it('flags leading and trailing days from neighbouring months', () => {
		const { weeks } = buildMonth(2026, 0, 1)
		expect(weeks[0][0]).toMatchObject({ day: 29, inMonth: false })
		expect(weeks[0][0].date.getMonth()).toBe(11)
		expect(weeks[0][0].date.getFullYear()).toBe(2025)
		const last = weeks[5][6]
		expect(last).toMatchObject({ day: 8, inMonth: false })
		expect(last.date.getMonth()).toBe(1)
	})

	it('flags Saturdays and Sundays as weekend', () => {
		const week = buildMonth(2026, 0, 1).weeks[1] // 5–11 January 2026, Monday first
		expect(week.map((day) => day.isWeekend)).toEqual([
			false,
			false,
			false,
			false,
			false,
			true,
			true,
		])
	})

	it('keeps consecutive days across a DST change', () => {
		const days = inMonthDays(2026, 2, 1)
		expect(days.map((day) => day.day)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1))
	})
})

describe('buildYear', () => {
	it('builds 12 months in order', () => {
		const months = buildYear(2026, 1)
		expect(months.map((month) => month.month)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		expect(months.every((month) => month.year === 2026)).toBe(true)
	})

	it('contains 365 or 366 days', () => {
		const count = (year: number) =>
			buildYear(year, 0).reduce(
				(sum, month) => sum + month.weeks.flat().filter((day) => day.inMonth).length,
				0,
			)
		expect(count(2026)).toBe(365)
		expect(count(2024)).toBe(366)
	})
})
