import { describe, expect, it } from 'vitest'
import { stacksDays } from './weekPerPage'

describe('stacksDays', () => {
	it('follows the orientation when automatic, but keeps two pages in columns', () => {
		expect(stacksDays('auto', 'portrait', false)).toBe(true)
		expect(stacksDays('auto', 'landscape', false)).toBe(false)
		expect(stacksDays('auto', 'portrait', true)).toBe(false)
		expect(stacksDays('auto', 'landscape', true)).toBe(false)
	})

	it('forces columns or rows whatever the page', () => {
		for (const twoPages of [false, true]) {
			for (const orientation of ['portrait', 'landscape'] as const) {
				expect(stacksDays('vertical', orientation, twoPages)).toBe(false)
				expect(stacksDays('horizontal', orientation, twoPages)).toBe(true)
			}
		}
	})
})
