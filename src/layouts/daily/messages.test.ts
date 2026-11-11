import { describe, expect, it } from 'vitest'
import { LOCALES } from '../../core/locale'
import { DAY_PAGE_MESSAGES } from './messages'

describe('DAY_PAGE_MESSAGES', () => {
	it('writes the week and the day of the year in the calendar’s language', () => {
		expect(DAY_PAGE_MESSAGES['en-US'].week(42)).toBe('Week 42')
		expect(DAY_PAGE_MESSAGES['en-US'].dayOfYear(292, 365)).toBe('Day 292 / 365')
		expect(DAY_PAGE_MESSAGES['ja-JP'].dayOfYear(292, 365)).toBe('292日目 / 365日')
	})

	it('includes the numbers in every language', () => {
		for (const locale of LOCALES) {
			expect(DAY_PAGE_MESSAGES[locale].week(42)).toContain('42')
			expect(DAY_PAGE_MESSAGES[locale].dayOfYear(292, 366)).toMatch(/292.*366/)
		}
	})
})
