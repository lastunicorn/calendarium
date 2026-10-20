import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultLayoutConfig, LAYOUT_IDS } from './index'

describe('default locale', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function defaultLocalesFor(language: string) {
		vi.stubGlobal('navigator', { language })
		return LAYOUT_IDS.map((layout) => defaultLayoutConfig(layout).locale)
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
		expect(defaultLocalesFor('th-TH')).toEqual(LAYOUT_IDS.map(() => 'en-GB'))
	})
})

describe('default week start', () => {
	it('lets the language choose the first day of the week in every layout', () => {
		for (const layout of LAYOUT_IDS) expect(defaultLayoutConfig(layout).weekStart).toBe('auto')
	})
})
