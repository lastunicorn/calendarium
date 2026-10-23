import { describe, expect, it } from 'vitest'
import { weeksOfYear } from '../../core/calendar'
import { splitWeekCells, weekCells } from './cells'

describe('weekCells', () => {
	/** Each cell as the weekdays it holds, 0 = Sunday. */
	function cellWeekdays(weekStart: 0 | 1 | 6, display: 'full' | 'reduced' | 'hidden') {
		return weekCells(weeksOfYear(2026, weekStart)[1], display).map((cell) =>
			cell.map((day) => day.weekday),
		)
	}

	it('gives every day its own cell when full', () => {
		expect(cellWeekdays(1, 'full')).toEqual([[1], [2], [3], [4], [5], [6], [0]])
	})

	it('puts Saturday and Sunday in one cell when reduced', () => {
		expect(cellWeekdays(1, 'reduced')).toEqual([[1], [2], [3], [4], [5], [6, 0]])
		expect(cellWeekdays(6, 'reduced')).toEqual([[6, 0], [1], [2], [3], [4], [5]])
	})

	it('falls back to full when the week starts on Sunday', () => {
		expect(cellWeekdays(0, 'reduced')).toEqual(cellWeekdays(0, 'full'))
	})

	it('leaves the weekend out when hidden', () => {
		expect(cellWeekdays(1, 'hidden')).toEqual([[1], [2], [3], [4], [5]])
		expect(cellWeekdays(0, 'hidden')).toEqual([[1], [2], [3], [4], [5]])
	})
})

describe('splitWeekCells', () => {
	/** Each page's cells as the weekdays they hold, 0 = Sunday. */
	function pageWeekdays(weekStart: 0 | 1 | 4 | 6, display: 'full' | 'reduced' | 'hidden') {
		return splitWeekCells(weekCells(weeksOfYear(2026, weekStart)[1], display)).map((cells) =>
			cells.map((cell) => cell.map((day) => day.weekday)),
		)
	}

	it('puts the first three days on the first page', () => {
		expect(pageWeekdays(1, 'full')).toEqual([
			[[1], [2], [3]],
			[[4], [5], [6], [0]],
		])
		expect(pageWeekdays(1, 'reduced')).toEqual([
			[[1], [2], [3]],
			[[4], [5], [6, 0]],
		])
		expect(pageWeekdays(1, 'hidden')).toEqual([
			[[1], [2], [3]],
			[[4], [5]],
		])
	})

	it('keeps a shared weekend cell on one page', () => {
		expect(pageWeekdays(6, 'reduced')).toEqual([
			[[6, 0], [1]],
			[[2], [3], [4], [5]],
		])
		expect(pageWeekdays(4, 'reduced')).toEqual([
			[[4], [5], [6, 0]],
			[[1], [2], [3]],
		])
	})
})
