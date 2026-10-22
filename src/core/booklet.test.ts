import { describe, expect, it } from 'vitest'
import { bookletPageCount, bookletSides } from './booklet'

describe('bookletPageCount', () => {
	it('rounds up to whole sheets of 4 pages', () => {
		expect(bookletPageCount(0)).toBe(0)
		expect(bookletPageCount(1)).toBe(4)
		expect(bookletPageCount(12)).toBe(12)
		expect(bookletPageCount(366)).toBe(368)
	})
})

describe('bookletSides', () => {
	it('has no sides without pages', () => {
		expect(bookletSides(0)).toEqual([])
	})

	it('puts the covers outside and the middle pages inside, on one sheet', () => {
		expect(bookletSides(4)).toEqual([
			[3, 0],
			[1, 2],
		])
	})

	it('nests the sheets, the first holding the first and last pages', () => {
		expect(bookletSides(8)).toEqual([
			[7, 0],
			[1, 6],
			[5, 2],
			[3, 4],
		])
	})

	it('completes the last sheet with blank pages, at the end', () => {
		expect(bookletSides(5)).toEqual(bookletSides(8))
	})

	it('places every page once, side by side with the one it faces when folded', () => {
		const sides = bookletSides(368)
		expect(sides).toHaveLength(368 / 2)
		expect(sides.flat().toSorted((a, b) => a - b)).toEqual([...Array(368).keys()])
		// Facing pages, on either side of the fold, add up to the last page's index.
		for (const [first, second] of sides) expect(first + second).toBe(367)
	})
})
