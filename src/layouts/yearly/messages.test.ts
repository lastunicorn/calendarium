import { describe, expect, it } from 'vitest'
import { LOCALES } from '../../core/locale'
import { YEAR_PAGE_MESSAGES } from './messages'

describe('YEAR_PAGE_MESSAGES', () => {
	it('names the list of events in every language', () => {
		expect(YEAR_PAGE_MESSAGES['en-US'].events).toBe('Events')
		for (const locale of LOCALES) expect(YEAR_PAGE_MESSAGES[locale].events).not.toBe('')
	})
})
