import { describe, expect, it } from 'vitest'

import { LOCALES } from '../../core/locale'
import { matchesFilter, searchText } from '../fields/filter'
import { LOCALE_OPTIONS, localeKeywords } from './localeOptions'

describe('localeKeywords', () => {
	it('names the language and the country in English and in the language itself', () => {
		// The names come from the ICU data, so only the stable ones are checked.
		const keywords = localeKeywords('pt-BR')
		expect(keywords[0]).toBe('pt-BR')
		expect(keywords).toEqual(expect.arrayContaining(['Portuguese', 'Brazil', 'Brasil']))
		expect(keywords).toHaveLength(5)
	})

	it('names a language written in another script in it', () => {
		expect(localeKeywords('ja-JP')).toEqual(expect.arrayContaining(['Japanese', '日本語']))
	})
})

describe('LOCALE_OPTIONS', () => {
	it('lists every locale once', () => {
		expect(LOCALE_OPTIONS.map((option) => option.value).toSorted()).toEqual(
			[...LOCALES].toSorted(),
		)
	})

	it('lists them by their English label, alphabetically', () => {
		const labels = LOCALE_OPTIONS.map((option) => option.label)
		expect(labels).toEqual(labels.toSorted((a, b) => a.localeCompare(b, 'en')))
	})

	it('finds a language by its country’s name in the language itself', () => {
		const found = LOCALE_OPTIONS.filter((option) =>
			matchesFilter(searchText(option), 'deutschland'),
		)
		expect(found.map((option) => option.value)).toEqual(['de-DE'])
	})
})
