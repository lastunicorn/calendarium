import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS } from './index'

describe('default locale', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function defaultLocalesFor(language: string) {
		vi.stubGlobal('navigator', { language })
		return LAYOUT_IDS.map((layout) => defaultLayoutOptions(layout).locale)
	}

	it('is British English for every layout in an English browser', () => {
		for (const language of ['en-US', 'en-GB', 'en']) {
			expect(defaultLocalesFor(language)).toEqual(LAYOUT_IDS.map(() => 'en-GB'))
		}
	})

	it('follows the browser when the calendar has its language', () => {
		expect(defaultLocalesFor('de-AT')).toEqual(LAYOUT_IDS.map(() => 'de-AT'))
		expect(defaultLocalesFor('de-LU')).toEqual(LAYOUT_IDS.map(() => 'de-DE'))
		expect(defaultLocalesFor('pt')).toEqual(LAYOUT_IDS.map(() => 'pt-BR'))
	})

	it('matches the whole language code, then the region', () => {
		expect(defaultLocalesFor('fil')).toEqual(LAYOUT_IDS.map(() => 'fil-PH'))
		expect(defaultLocalesFor('zh-TW')).toEqual(LAYOUT_IDS.map(() => 'zh-TW'))
		expect(defaultLocalesFor('zh-SG')).toEqual(LAYOUT_IDS.map(() => 'zh-CN'))
	})

	it('falls back to British English', () => {
		expect(defaultLocalesFor('he-IL')).toEqual(LAYOUT_IDS.map(() => 'en-GB'))
	})
})

describe('default week start', () => {
	it('lets the language choose the first day of the week in every layout', () => {
		for (const layout of LAYOUT_IDS) expect(defaultLayoutOptions(layout).weekStart).toBe('auto')
	})
})
