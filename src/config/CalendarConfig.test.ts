import { describe, expect, it } from 'vitest'
import { buildMonth } from '../core/calendar'
import { isYear, MAX_YEAR, MIN_YEAR } from './CalendarConfig'

describe('isYear', () => {
	it('accepts the Gregorian years from MIN_YEAR to MAX_YEAR', () => {
		expect(isYear(MIN_YEAR)).toBe(true)
		expect(isYear(2026)).toBe(true)
		expect(isYear(MAX_YEAR)).toBe(true)
	})

	it('rejects years that Date would misread or that predate the Gregorian calendar', () => {
		expect(isYear(50)).toBe(false)
		expect(isYear(99)).toBe(false)
		expect(isYear(1582)).toBe(false)
		expect(isYear(MAX_YEAR + 1)).toBe(false)
	})

	it('only allows years whose dates are built in that year', () => {
		for (const year of [MIN_YEAR, MAX_YEAR]) {
			const days = buildMonth(year, 5, 1).weeks.flat()
			for (const day of days) {
				expect(day.date.getFullYear()).toBe(year)
			}
		}
	})
})
