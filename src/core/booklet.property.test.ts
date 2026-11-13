import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { bookletPageCount, bookletSides } from './booklet'

// The rules a booklet's imposition follows for every page count, checked on random ones
// (`booklet.test.ts` has the examples): whole sheets, every page printed once, and each side's two
// pages the ones the fold brings together.

const RUNS = { numRuns: 200 }

/** Up to two pages per day of a leap year, and a little more. */
const pageCount = fc.integer({ min: 0, max: 800 })

describe('bookletPageCount', () => {
	it('rounds up to the fewest whole sheets of 4 pages', () => {
		fc.assert(
			fc.property(pageCount, (pageCount) => {
				const pages = bookletPageCount(pageCount)
				expect(pages % 4).toBe(0)
				expect(pages).toBeGreaterThanOrEqual(pageCount)
				expect(pages - pageCount).toBeLessThan(4)
			}),
			RUNS,
		)
	})
})

describe('bookletSides', () => {
	it('prints every page of the booklet once, two to a side, on both sides of each sheet', () => {
		fc.assert(
			fc.property(pageCount, (pageCount) => {
				const pages = bookletPageCount(pageCount)
				const sides = bookletSides(pageCount)
				expect(sides).toHaveLength(pages / 2)
				expect(sides.flat().toSorted((a, b) => a - b)).toEqual(
					Array.from({ length: pages }, (_, i) => i),
				)
			}),
			RUNS,
		)
	})

	it('puts on each side two pages the same distance from either end, the covers first', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 800 }), (pageCount) => {
				const last = bookletPageCount(pageCount) - 1
				const sides = bookletSides(pageCount)
				expect(sides.every(([left, right]) => left + right === last)).toBe(true)
				expect(sides[0]).toEqual([last, 0])
				// Each sheet's back holds the pages next to its front's, nearer the middle.
				for (let sheet = 0; sheet < sides.length; sheet += 2) {
					const [, front] = sides[sheet]
					expect(sides[sheet + 1]).toEqual([front + 1, last - front - 1])
				}
			}),
			RUNS,
		)
	})
})
