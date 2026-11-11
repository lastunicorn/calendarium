import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { WEEKLY_MIGRATIONS } from './migrations'
import { WEEKLY_SPEC } from './options'

describe('weekly migrations', () => {
	const from3 = WEEKLY_MIGRATIONS[3]!

	it('turn the 3 weekend highlight and week numbers into the heading’s options', () => {
		const options = { year: 2030, highlightWeekends: 'columns', showWeekNumbers: false }
		expect(from3(options)).toEqual({
			year: 2030,
			highlightWeekendDays: true,
			showHeaderWeek: false,
		})
		const parsed = parseOptions(WEEKLY_SPEC, from3({ highlightWeekends: 'off' }))
		expect(parsed.highlightWeekendDays).toBe(false)
	})

	it('keep an unknown weekend highlight for parsing to reject', () => {
		expect(from3({ highlightWeekends: 'always' })).toMatchObject({
			highlightWeekendDays: 'always',
		})
	})

	const from4 = WEEKLY_MIGRATIONS[4]!

	it('turn the automatic days direction into what it drew', () => {
		const portrait = { orientation: 'portrait' }
		const landscape = { orientation: 'landscape' }
		const direction = (options: object) =>
			from4({ weekDayDirection: 'auto', ...options }).weekDayDirection
		expect(direction({ page: portrait })).toBe('horizontal')
		expect(direction({ page: portrait, twoPagesPerWeek: true })).toBe('vertical')
		expect(direction({ page: landscape })).toBe('vertical')
		expect(direction({ page: landscape, twoPagesPerWeek: true })).toBe('vertical')
		expect(direction({})).toBe('vertical')
	})

	it('keep any other days direction as is', () => {
		const options = { weekDayDirection: 'horizontal', page: { orientation: 'landscape' } }
		expect(from4(options)).toBe(options)
	})
})
