import { describe, expect, it } from 'vitest'
import { LOCALES } from './locale'
import { PRINT_MESSAGES } from './messages'

describe('PRINT_MESSAGES', () => {
	it('writes the week and day of the year in the calendar’s language', () => {
		expect(PRINT_MESSAGES['en-US'].week(42)).toBe('Week 42')
		expect(PRINT_MESSAGES['en-US'].dayOfYear(292, 365)).toBe('Day 292 / 365')
		expect(PRINT_MESSAGES['ro-RO'].week(42)).toBe('Săptămâna 42')
		expect(PRINT_MESSAGES['ja-JP'].dayOfYear(292, 365)).toBe('292日目 / 365日')
	})

	it('includes the numbers in every language', () => {
		for (const locale of LOCALES) {
			expect(PRINT_MESSAGES[locale].week(42)).toContain('42')
			expect(PRINT_MESSAGES[locale].dayOfYear(292, 366)).toMatch(/292.*366/)
		}
	})
})
