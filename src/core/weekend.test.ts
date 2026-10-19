import { describe, expect, it } from 'vitest'
import { buildMonth, type CalendarDay, weeksOfYear } from './calendar'
import { isHighlightedColumn, isHighlightedDay, isHighlightedWeekDay, weekCells } from './weekend'

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

describe('isHighlightedWeekDay', () => {
	// 2027 starts on a Friday: its first Monday week holds Saturday, January 2, and its last
	// holds Saturday, January 1, 2028.
	const weeks = weeksOfYear(2027, 1)
	const inYear = weeks[0][5]
	const nextYear = weeks.at(-1)![5]

	it('highlights weekend days of another year only in columns mode', () => {
		expect(nextYear.inYear).toBe(false)
		expect(isHighlightedWeekDay(inYear, 'days')).toBe(true)
		expect(isHighlightedWeekDay(nextYear, 'days')).toBe(false)
		expect(isHighlightedWeekDay(nextYear, 'columns')).toBe(true)
		expect(isHighlightedWeekDay(inYear, 'off')).toBe(false)
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

describe('weekCells', () => {
	/** Each cell as the weekdays it holds, 0 = Sunday. */
	function cellWeekdays(weekStart: 0 | 1 | 6, display: 'full' | 'collapsed' | 'off') {
		return weekCells(weeksOfYear(2026, weekStart)[1], display).map((cell) =>
			cell.map((day) => day.weekday),
		)
	}

	it('gives every day its own cell when full', () => {
		expect(cellWeekdays(1, 'full')).toEqual([[1], [2], [3], [4], [5], [6], [0]])
	})

	it('puts Saturday and Sunday in one cell when collapsed', () => {
		expect(cellWeekdays(1, 'collapsed')).toEqual([[1], [2], [3], [4], [5], [6, 0]])
		expect(cellWeekdays(6, 'collapsed')).toEqual([[6, 0], [1], [2], [3], [4], [5]])
	})

	it('falls back to full when the week starts on Sunday', () => {
		expect(cellWeekdays(0, 'collapsed')).toEqual(cellWeekdays(0, 'full'))
	})

	it('leaves the weekend out when off', () => {
		expect(cellWeekdays(1, 'off')).toEqual([[1], [2], [3], [4], [5]])
		expect(cellWeekdays(0, 'off')).toEqual([[1], [2], [3], [4], [5]])
	})
})
