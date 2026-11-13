import { describe, expect, it } from 'vitest'

import { matchesFilter, searchText } from './filter'

const ROMANIAN = { value: 'ro-RO', label: 'Romanian (Română)', keywords: ['România'] }

describe('searchText', () => {
	it('joins the label and the keywords, lowercased and without accents', () => {
		expect(searchText(ROMANIAN)).toBe('romanian (romana) romania')
	})

	it('is the label alone without keywords', () => {
		expect(searchText({ value: 1, label: 'Monday' })).toBe('monday')
	})
})

describe('matchesFilter', () => {
	const text = searchText(ROMANIAN)

	it('finds a word whatever its case and accents', () => {
		expect(matchesFilter(text, 'ROMÂNĂ')).toBe(true)
		expect(matchesFilter(text, 'romana')).toBe(true)
	})

	it('finds part of a word', () => {
		expect(matchesFilter(text, 'rom')).toBe(true)
	})

	it('finds a keyword', () => {
		expect(matchesFilter(text, 'românia')).toBe(true)
	})

	it('needs every word of the query, in any order', () => {
		expect(matchesFilter(text, 'romana romanian')).toBe(true)
		expect(matchesFilter(text, 'romanian german')).toBe(false)
	})

	it('matches anything with an empty query', () => {
		expect(matchesFilter(text, '')).toBe(true)
	})
})
