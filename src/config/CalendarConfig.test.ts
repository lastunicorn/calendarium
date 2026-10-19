import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildMonth } from '../core/calendar'
import { DEFAULTS, isYear, LAYOUT_IDS, MAX_YEAR, MIN_YEAR } from './CalendarConfig'

describe('isYear', () => {
	it('accepts the Gregorian years from MIN_YEAR to MAX_YEAR', () => {
		expect(isYear(MIN_YEAR)).toBe(true)
		expect(isYear(2026)).toBe(true)
		expect(isYear(MAX_YEAR)).toBe(true)
	})

	it('rejects years that Date would misread or that predate the Gregorian calendar', () => {
		expect(isYear(50)).toBe(false)
		expect(isYear(99)).toBe(false)
		expect(isYear(1582)).toBe(false)
		expect(isYear(MAX_YEAR + 1)).toBe(false)
	})

	it('only allows years whose dates are built in that year', () => {
		for (const year of [MIN_YEAR, MAX_YEAR]) {
			const days = buildMonth(year, 5, 1).weeks.flat()
			for (const day of days) {
				expect(day.date.getFullYear()).toBe(year)
			}
		}
	})
})

describe('default locale', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function defaultLocalesFor(language: string) {
		vi.stubGlobal('navigator', { language })
		return LAYOUT_IDS.map((layout) => DEFAULTS[layout]().locale)
	}

	it('is British English for every layout in an English browser', () => {
		for (const language of ['en-US', 'en-GB', 'en']) {
			expect(defaultLocalesFor(language)).toEqual(LAYOUT_IDS.map(() => 'en-GB'))
		}
	})

	it('follows the browser when the calendar has its language', () => {
		expect(defaultLocalesFor('de-AT')).toEqual(LAYOUT_IDS.map(() => 'de-DE'))
	})

	it('falls back to British English', () => {
		expect(defaultLocalesFor('zh-CN')).toEqual(LAYOUT_IDS.map(() => 'en-GB'))
	})
})

describe('default week start', () => {
	it('lets the language choose the first day of the week in every layout', () => {
		for (const layout of LAYOUT_IDS) expect(DEFAULTS[layout]().weekStart).toBe('auto')
	})
})
