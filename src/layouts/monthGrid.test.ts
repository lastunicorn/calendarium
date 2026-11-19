import { describe, expect, it } from 'vitest'

import { calendarModel } from './common'
import { defaultLayoutOptions } from './index'
import { miniMonthPlanner, miniMonthStyleDefaults, monthAt, type MiniMonthStyle } from './monthGrid'

/** The calendar model of 2026 in British English, its weeks from Monday. */
const MODEL = calendarModel(defaultLayoutOptions('monthly', { year: 2026, language: 'en-GB' }))

/** The year and month (0–11) of the month `offset` months from `month` of 2026. */
function at(month: number, offset: number): [number, number] {
	const shown = monthAt(MODEL, MODEL.months[month], offset)
	return [shown.year, shown.month]
}

describe('monthAt', () => {
	it('counts back and forth across the year’s ends', () => {
		expect(at(5, 1)).toEqual([2026, 6])
		expect(at(5, -1)).toEqual([2026, 4])
		expect(at(0, -1)).toEqual([2025, 11])
		expect(at(11, 1)).toEqual([2027, 0])
		expect(at(0, -13)).toEqual([2024, 11])
		expect(at(11, 13)).toEqual([2028, 0])
	})

	it('gives the model’s own month of its year, and builds the others', () => {
		expect(monthAt(MODEL, MODEL.months[3], 1)).toBe(MODEL.months[4])
		expect(monthAt(MODEL, MODEL.months[3], 0)).toBe(MODEL.months[3])
		const december = monthAt(MODEL, MODEL.months[0], -1)
		expect(december.weeks[0][0].key).toBe('2025-12-01')
		// Back in the model's year from another one.
		expect(monthAt(MODEL, december, 1)).toBe(MODEL.months[0])
	})
})

describe('miniMonthPlanner', () => {
	function planner(changes: Partial<MiniMonthStyle> = {}) {
		return miniMonthPlanner({ ...miniMonthStyleDefaults(), ...changes }, 'en-GB', MODEL)
	}

	it('titles a mini month with its month, followed by its year with `showYear`', () => {
		const january = MODEL.months[0]
		expect(planner()(january).name).toBe('January')
		expect(planner({ showYear: true })(january).name).toBe('January 2026')
		expect(planner({ showYear: true })(monthAt(MODEL, january, -1)).name).toBe('December 2025')
	})

	it('draws the month in its style, with the marks given, the weekday labels shared', () => {
		const plan = planner({
			size: 'small',
			highlightWeekends: 'columns',
			weekdayFormat: 'short',
		})
		const march = plan(MODEL.months[2], { markedDay: 9, eventDays: [1, 9] })
		expect(march).toEqual({
			month: MODEL.months[2],
			name: 'March',
			weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			highlightWeekends: 'columns',
			showWeekNumbers: false,
			size: 'small',
			markedDay: 9,
			eventDays: [1, 9],
		})
		const april = plan(MODEL.months[3])
		expect(april).not.toHaveProperty('markedDay')
		expect(april.weekdays).toBe(march.weekdays)
	})
})
