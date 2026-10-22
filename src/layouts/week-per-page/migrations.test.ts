import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { WEEK_PER_PAGE_MIGRATIONS } from './migrations'
import { WEEK_PER_PAGE_SPEC } from './options'

describe('week-per-page migrations', () => {
	const from3 = WEEK_PER_PAGE_MIGRATIONS[3]!

	it('turn the 3 weekend highlight and week numbers into the heading’s options', () => {
		const options = { year: 2030, highlightWeekends: 'columns', showWeekNumbers: false }
		expect(from3(options)).toEqual({
			year: 2030,
			highlightWeekendDays: true,
			showHeaderWeek: false,
		})
		const parsed = parseOptions(WEEK_PER_PAGE_SPEC, from3({ highlightWeekends: 'off' }))
		expect(parsed.highlightWeekendDays).toBe(false)
	})

	it('keep an unknown weekend highlight for parsing to reject', () => {
		expect(from3({ highlightWeekends: 'always' })).toMatchObject({
			highlightWeekendDays: 'always',
		})
	})
})
