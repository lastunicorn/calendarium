import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
	buildMonth,
	buildYear,
	dayOfYear,
	daysInMonth,
	daysOfYear,
	isLeapYear,
	isoWeek,
	MAX_YEAR,
	MIN_YEAR,
	plainDate,
	weekdayColumn,
	weekNumber,
	WEEKS_PER_MONTH,
	weeksOfYear,
	type PlainDate,
	type WeekStart,
} from './calendar'

// The rules the calendar math follows for every year and week start, checked on random ones
// (`calendar.test.ts` has the examples): no day missing or drawn twice, every week of 7
// consecutive days from the week start, the week numbers in range.

const RUNS = { numRuns: 200 }

/** Any Gregorian year, the century years (leap or not) and the range's ends more often. */
const year = fc.oneof(
	fc.integer({ min: MIN_YEAR, max: MAX_YEAR }),
	fc.constantFrom(MIN_YEAR, 1600, 1700, 1900, 2000, 2100, MAX_YEAR),
)
const weekStart = fc.integer({ min: 0, max: 6 }) as fc.Arbitrary<WeekStart>
const month = fc.integer({ min: 0, max: 11 })

/** The day after `date`. */
function next(date: PlainDate): PlainDate {
	return plainDate(date.year, date.month, date.day + 1)
}

/** Whether `dates` follow one another, a day apart. */
function consecutive(dates: PlainDate[]): boolean {
	return dates.every((date, i) => i === 0 || next(dates[i - 1]).key === date.key)
}

function yearLength(year: number): number {
	return isLeapYear(year) ? 366 : 365
}

describe('weeksOfYear', () => {
	it('holds every day of the year once, in order, in weeks of 7 days from the week start', () => {
		fc.assert(
			fc.property(year, weekStart, (year, weekStart) => {
				const weeks = weeksOfYear(year, weekStart)
				const days = weeks.flat()
				expect(weeks.every((week) => week.length === 7)).toBe(true)
				expect(weeks.every((week) => week[0].weekday === weekStart)).toBe(true)
				expect(consecutive(days)).toBe(true)
				const inYear = days.filter((day) => day.inYear)
				expect(inYear.every((day) => day.year === year)).toBe(true)
				expect(inYear).toHaveLength(yearLength(year))
				expect(inYear[0].key).toBe(plainDate(year, 0, 1).key)
				// No week is all outside the year.
				expect(weeks.every((week) => week.some((day) => day.inYear))).toBe(true)
			}),
			RUNS,
		)
	})

	it('has 53 weeks, or 54 when a leap year starts on the last day of a week', () => {
		fc.assert(
			fc.property(year, weekStart, (year, weekStart) => {
				const january1 = weekdayColumn(plainDate(year, 0, 1).weekday, weekStart)
				const expected = isLeapYear(year) && january1 === 6 ? 54 : 53
				expect(weeksOfYear(year, weekStart)).toHaveLength(expected)
			}),
			RUNS,
		)
	})
})

describe('buildMonth', () => {
	it('is 6 weeks of consecutive days from the week start, holding every day of the month', () => {
		fc.assert(
			fc.property(year, month, weekStart, (year, month, weekStart) => {
				const { weeks } = buildMonth(year, month, weekStart)
				const days = weeks.flat()
				expect(weeks).toHaveLength(WEEKS_PER_MONTH)
				expect(days).toHaveLength(7 * WEEKS_PER_MONTH)
				expect(days[0].weekday).toBe(weekStart)
				expect(consecutive(days)).toBe(true)
				const inMonth = days.filter((day) => day.inMonth)
				expect(inMonth.map((day) => day.day)).toEqual(
					Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
				)
				expect(inMonth.every((day) => day.year === year && day.month === month)).toBe(true)
			}),
			RUNS,
		)
	})
})

describe('daysOfYear', () => {
	it('is every day of the year once, in order, from January 1', () => {
		fc.assert(
			fc.property(year, weekStart, (year, weekStart) => {
				const days = daysOfYear(buildYear(year, weekStart))
				expect(days).toHaveLength(yearLength(year))
				expect(days[0].key).toBe(plainDate(year, 0, 1).key)
				expect(consecutive(days)).toBe(true)
				expect(days.map(dayOfYear)).toEqual(days.map((_, i) => i + 1))
			}),
			RUNS,
		)
	})
})

describe('isoWeek', () => {
	it('numbers the Monday weeks of a year from 1 to 52 or 53, a week apart, as weekNumber does', () => {
		fc.assert(
			fc.property(year, (year) => {
				const weeks = weeksOfYear(year, 1)
				for (const week of weeks) {
					const number = weekNumber(week)
					expect(week.every((day) => isoWeek(day) === number)).toBe(true)
				}
				const numbers = weeks.map(weekNumber)
				expect(numbers.every((number) => number >= 1 && number <= 53)).toBe(true)
				// Between the first and the last week, which may belong to the years either side.
				const middle = numbers.slice(1, -1)
				expect(middle.every((number, i) => i === 0 || number === middle[i - 1] + 1)).toBe(
					true,
				)
			}),
			RUNS,
		)
	})

	it('gives a week starting on any day the number of the week holding its Thursday', () => {
		fc.assert(
			fc.property(year, weekStart, (year, weekStart) => {
				for (const week of weeksOfYear(year, weekStart)) {
					const thursday = week.find((day) => day.weekday === 4)!
					expect(weekNumber(week)).toBe(isoWeek(thursday))
				}
			}),
			RUNS,
		)
	})
})

describe('plainDate', () => {
	it('rolls a day past the month over into the next, keeping the key in step', () => {
		fc.assert(
			fc.property(year, fc.integer({ min: 1, max: 366 }), (year, day) => {
				const date = plainDate(year, 0, day)
				const [y, m, d] = date.key.split('-').map(Number)
				expect([y, m - 1, d]).toEqual([date.year, date.month, date.day])
				if (day <= yearLength(year)) expect(dayOfYear(date)).toBe(day)
				else expect(date.year).toBe(year + 1)
			}),
			RUNS,
		)
	})
})
