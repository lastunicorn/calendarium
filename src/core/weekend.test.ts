import { describe, expect, it } from 'vitest'
import { buildMonth, type CalendarDay } from './calendar'
import { isHighlightedColumn, isHighlightedDay } from './weekend'

// January 2026 starting on Monday: the first row is Dec 29 – Jan 4, so it holds
// in-month weekend days (Jan 3, 4); the last row is Feb 2 – 8, all outside the month.
const weeks = buildMonth(2026, 0, 1).weeks
const saturday = weeks[0][5]
const weekday = weeks[0][0]
const outsideSaturday = weeks[5][5]

function check(day: CalendarDay) {
	return {
		off: isHighlightedDay(day, 'off'),
		days: isHighlightedDay(day, 'days'),
		columns: isHighlightedDay(day, 'columns'),
	}
}

describe('isHighlightedDay', () => {
	it('never highlights weekdays', () => {
		expect(check(weekday)).toEqual({ off: false, days: false, columns: false })
	})

	it('highlights in-month weekend days unless off', () => {
		expect(check(saturday)).toEqual({ off: false, days: true, columns: true })
	})

	it('highlights weekend days outside the month only in columns mode', () => {
		expect(outsideSaturday.inMonth).toBe(false)
		expect(check(outsideSaturday)).toEqual({ off: false, days: false, columns: true })
	})
})

describe('isHighlightedColumn', () => {
	it('highlights weekend columns unless off', () => {
		expect(isHighlightedColumn(saturday, 'off')).toBe(false)
		expect(isHighlightedColumn(saturday, 'days')).toBe(true)
		expect(isHighlightedColumn(saturday, 'columns')).toBe(true)
		expect(isHighlightedColumn(weekday, 'columns')).toBe(false)
	})
})
