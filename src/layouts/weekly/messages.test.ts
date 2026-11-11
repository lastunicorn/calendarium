import { describe, expect, it } from 'vitest'
import { LOCALES } from '../../core/locale'
import { WEEK_PAGE_MESSAGES } from './messages'

describe('WEEK_PAGE_MESSAGES', () => {
	it('writes the week in the calendar’s language', () => {
		expect(WEEK_PAGE_MESSAGES['en-US'].week(42)).toBe('Week 42')
		expect(WEEK_PAGE_MESSAGES['ro-RO'].week(42)).toBe('Săptămâna 42')
	})

	it('includes the number in every language', () => {
		for (const locale of LOCALES) expect(WEEK_PAGE_MESSAGES[locale].week(42)).toContain('42')
	})
})
