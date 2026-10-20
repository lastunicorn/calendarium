import { describe, expect, it } from 'vitest'
import {
	buildMonth,
	buildYear,
	dayOfYear,
	daysInMonth,
	daysOfYear,
	isLeapYear,
	isoWeek,
	isYear,
	MAX_YEAR,
	MIN_YEAR,
	plainDate,
	weekdayColumn,
	type WeekStart,
	WEEKS_PER_MONTH,
	visibleWeeks,
	weekMonth,
	weekNumber,
	weeksOfYear,
} from './calendar'

const WEEK_STARTS: WeekStart[] = [0, 1, 2, 3, 4, 5, 6]

function inMonthDays(year: number, month: number, weekStart: WeekStart) {
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

describe('plainDate', () => {
	it('holds the date’s components, weekday and key', () => {
		expect(plainDate(2026, 9, 19)).toEqual({
			year: 2026,
			month: 9,
			day: 19,
			weekday: 1,
			key: '2026-10-19',
		})
	})

	it('rolls over out-of-range components', () => {
		expect(plainDate(2026, 0, 0)).toMatchObject({ year: 2025, month: 11, day: 31 })
		expect(plainDate(2024, 1, 30)).toMatchObject({ year: 2024, month: 2, day: 1 })
		expect(plainDate(2026, 12, 1)).toMatchObject({ year: 2027, month: 0, day: 1 })
	})

	it('takes years below 100 as written', () => {
		expect(plainDate(50, 1, 10)).toMatchObject({ year: 50, key: '0050-02-10' })
	})
})

describe('weekdayColumn', () => {
	it('counts from the week start, wrapping past Saturday', () => {
		expect(weekdayColumn(1, 1)).toBe(0) // Monday in a Monday week
		expect(weekdayColumn(0, 1)).toBe(6) // Sunday in a Monday week
		expect(weekdayColumn(0, 0)).toBe(0) // Sunday in a Sunday week
		expect(weekdayColumn(5, 6)).toBe(6) // Friday in a Saturday week
	})

	it('gives each weekday its own column for every week start', () => {
		for (const weekStart of WEEK_STARTS) {
			const columns = WEEK_STARTS.map((weekday) => weekdayColumn(weekday, weekStart))
			expect([...columns].sort()).toEqual([0, 1, 2, 3, 4, 5, 6])
		}
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
		for (const weekStart of WEEK_STARTS) {
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
		const thursday = buildMonth(2026, 0, 4).weeks[0]
		expect(thursday.findIndex((day) => day.inMonth)).toBe(0)
		const friday = buildMonth(2026, 0, 5).weeks[0]
		expect(friday.findIndex((day) => day.inMonth)).toBe(6)
	})

	it('starts every week on the week start day', () => {
		for (const weekStart of WEEK_STARTS) {
			for (const week of buildMonth(2026, 2, weekStart).weeks)
				expect(week[0].weekday).toBe(weekStart)
		}
	})

	it('starts on the first cell when the month begins on the week start', () => {
		// 1 June 2026 is a Monday; 1 February 2026 is a Sunday.
		expect(buildMonth(2026, 5, 1).weeks[0][0]).toMatchObject({ day: 1, inMonth: true })
		expect(buildMonth(2026, 1, 0).weeks[0][0]).toMatchObject({ day: 1, inMonth: true })
	})

	it('flags leading and trailing days from neighbouring months', () => {
		const { weeks } = buildMonth(2026, 0, 1)
		expect(weeks[0][0]).toMatchObject({ year: 2025, month: 11, day: 29, inMonth: false })
		expect(weeks[5][6]).toMatchObject({ year: 2026, month: 1, day: 8, inMonth: false })
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

	it('builds years below 100 as written', () => {
		const days = buildMonth(50, 1, 1).weeks.flat()
		expect(days.filter((day) => day.inMonth).every((day) => day.year === 50)).toBe(true)
		// 1 February 50 was a Tuesday; 1 February 1950 a Wednesday.
		expect(days.find((day) => day.inMonth)?.weekday).toBe(2)
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

describe('daysOfYear', () => {
	it('lists every day of the year once, in order', () => {
		for (const year of [2024, 2026]) {
			const days = daysOfYear(buildYear(year, 1))
			expect(days).toHaveLength(isLeapYear(year) ? 366 : 365)
			days.forEach((day, index) => {
				expect(day).toMatchObject(plainDate(year, 0, 1 + index))
				expect(day.inMonth).toBe(true)
			})
		}
	})
})

describe('dayOfYear', () => {
	it('counts from 1 on January 1', () => {
		expect(dayOfYear(plainDate(2026, 0, 1))).toBe(1)
		expect(dayOfYear(plainDate(2026, 1, 1))).toBe(32)
		expect(dayOfYear(plainDate(2026, 11, 31))).toBe(365)
	})

	it('counts February 29 in leap years', () => {
		expect(dayOfYear(plainDate(2024, 1, 29))).toBe(60)
		expect(dayOfYear(plainDate(2024, 11, 31))).toBe(366)
	})

	it('ignores DST changes', () => {
		expect(dayOfYear(plainDate(2026, 2, 30))).toBe(89)
		expect(dayOfYear(plainDate(2026, 9, 26))).toBe(299)
	})
})

describe('isoWeek', () => {
	it('numbers weeks from the one containing the first Thursday', () => {
		expect(isoWeek(plainDate(2026, 0, 1))).toBe(1) // Thursday
		expect(isoWeek(plainDate(2026, 0, 5))).toBe(2)
		expect(isoWeek(plainDate(2026, 9, 18))).toBe(42)
	})

	it('puts early January days in the previous year’s last week', () => {
		expect(isoWeek(plainDate(2021, 0, 3))).toBe(53) // Sunday after 2020-W53
		expect(isoWeek(plainDate(2023, 0, 1))).toBe(52)
	})

	it('puts late December days in the next year’s first week', () => {
		expect(isoWeek(plainDate(2024, 11, 30))).toBe(1)
		expect(isoWeek(plainDate(2025, 11, 31))).toBe(1)
	})

	it('reaches week 53 in long years', () => {
		expect(isoWeek(plainDate(2026, 11, 31))).toBe(53)
		expect(isoWeek(plainDate(2020, 11, 31))).toBe(53)
	})
})

describe('weekNumber', () => {
	it('matches the ISO week for Monday-first rows', () => {
		const { weeks } = buildMonth(2026, 0, 1)
		expect(weeks.map(weekNumber)).toEqual([1, 2, 3, 4, 5, 6])
	})

	it('uses the ISO week holding most days of the row', () => {
		// Sunday-first row 4–10 January 2026: Monday–Saturday are in W02.
		expect(weekNumber(buildMonth(2026, 0, 0).weeks[1])).toBe(2)
		// Friday-first row 2–8 January 2026: Monday–Thursday are in W02.
		expect(weekNumber(buildMonth(2026, 0, 5).weeks[1])).toBe(2)
		// Saturday-first row 27 Dec 2025 – 2 Jan 2026 contains 1 January (W01).
		expect(weekNumber(buildMonth(2026, 0, 6).weeks[0])).toBe(1)
	})
})

describe('weekMonth', () => {
	// Monday-first weeks of 2026: 29 Dec 2025 – 4 Jan, …, 26 Jan – 1 Feb, …, 28 Dec – 3 Jan 2027.
	const weeks = weeksOfYear(2026, 1)

	it('is the month holding most of the week’s days', () => {
		expect(weekMonth(weeks[4])).toBe(0)
		// Thursday 29 January to Wednesday 4 February: four days in February.
		expect(weekMonth(weeksOfYear(2026, 4)[5])).toBe(1)
	})

	it('counts only the days of the year', () => {
		expect(weekMonth(weeks[0])).toBe(0)
		expect(weekMonth(weeks.at(-1)!)).toBe(11)
	})

	it('keeps the earlier month on a tie', () => {
		// Two days of the week of 29 June – 5 July 2026, one in each month.
		const week = weeks.find((days) => days[0].key === '2026-06-29')!
		const tie = week.filter((day) => day.key === '2026-06-30' || day.key === '2026-07-01')
		expect(weekMonth(tie)).toBe(5)
	})
})

describe('visibleWeeks', () => {
	it('drops rows without days of the month', () => {
		// February 2027 starts on a Monday and has 28 days: exactly 4 rows.
		expect(visibleWeeks(buildMonth(2027, 1, 1))).toHaveLength(4)
		// March 2026 starts on a Sunday: with Monday first it spans 6 rows.
		expect(visibleWeeks(buildMonth(2026, 2, 1))).toHaveLength(6)
		// The same March starting weeks on Sunday needs only 5.
		expect(visibleWeeks(buildMonth(2026, 2, 0))).toHaveLength(5)
	})

	it('keeps every day of the month', () => {
		for (const weekStart of [0, 1, 6] as WeekStart[]) {
			for (let month = 0; month < 12; month++) {
				const days = visibleWeeks(buildMonth(2026, month, weekStart))
					.flat()
					.filter((day) => day.inMonth)
				expect(days).toHaveLength(daysInMonth(2026, month))
			}
		}
	})
})

describe('weeksOfYear', () => {
	it('covers the year from the week of January 1 to the week of December 31', () => {
		// 2026 starts and ends on a Thursday: Monday weeks run from Dec 29, 2025 to Jan 3, 2027.
		const weeks = weeksOfYear(2026, 1)
		expect(weeks).toHaveLength(53)
		expect(weeks[0][0].key).toBe('2025-12-29')
		expect(weeks.at(-1)!.at(-1)!.key).toBe('2027-01-03')
	})

	it('marks only the days of the previous and next year as outside it', () => {
		const days = weeksOfYear(2026, 1).flat()
		expect(days.filter((day) => day.inYear)).toHaveLength(365)
		expect(days.filter((day) => !day.inYear).map((day) => day.key)).toEqual([
			'2025-12-29',
			'2025-12-30',
			'2025-12-31',
			'2027-01-01',
			'2027-01-02',
			'2027-01-03',
		])
	})

	it('has no week outside the year, for any week start', () => {
		for (const year of [2024, 2025, 2026, 2028]) {
			for (const weekStart of WEEK_STARTS) {
				const weeks = weeksOfYear(year, weekStart)
				for (const week of weeks) {
					expect(week).toHaveLength(7)
					expect(week[0].weekday).toBe(weekStart)
					expect(week.some((day) => day.inYear)).toBe(true)
				}
				expect(weeks.flat().filter((day) => day.inYear)).toHaveLength(
					isLeapYear(year) ? 366 : 365,
				)
			}
		}
	})

	it('has a 54th week when a leap year starts on the week’s last day', () => {
		// 2028 starts on a Saturday, the last day of a Sunday week.
		expect(weeksOfYear(2028, 0)).toHaveLength(54)
		expect(weeksOfYear(2028, 1)).toHaveLength(53)
	})

	it('starts with January 1 when the year starts on the week start', () => {
		// 2024 starts on a Monday.
		const weeks = weeksOfYear(2024, 1)
		expect(weeks[0].every((day) => day.inYear)).toBe(true)
		expect(weeks[0][0].key).toBe('2024-01-01')
	})
})

describe('isYear', () => {
	it('accepts the Gregorian years from MIN_YEAR to MAX_YEAR', () => {
		expect(isYear(MIN_YEAR)).toBe(true)
		expect(isYear(2026)).toBe(true)
		expect(isYear(MAX_YEAR)).toBe(true)
	})

	it('rejects years that predate the Gregorian calendar', () => {
		expect(isYear(50)).toBe(false)
		expect(isYear(99)).toBe(false)
		expect(isYear(1582)).toBe(false)
		expect(isYear(MAX_YEAR + 1)).toBe(false)
	})

	it('only allows years whose dates are built in that year', () => {
		for (const year of [MIN_YEAR, MAX_YEAR]) {
			const days = buildMonth(year, 5, 1).weeks.flat()
			for (const day of days) {
				expect(day.year).toBe(year)
			}
		}
	})
})
