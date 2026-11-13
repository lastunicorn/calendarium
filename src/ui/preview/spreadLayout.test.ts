import { describe, expect, it } from 'vitest'

import { BINDING_WIDTH, ringCount, spreadCount, spreadDimensions, spreadOf } from './spreadLayout'

const A4_PORTRAIT = { paperSize: 'a4', orientation: 'portrait' } as const

describe('spreadCount', () => {
	it('makes no spread of no page', () => {
		expect(spreadCount(0)).toBe(0)
	})

	it('puts the first page alone, then the others two by two', () => {
		expect([1, 2, 3, 4, 5].map(spreadCount)).toEqual([1, 2, 2, 3, 3])
	})
})

describe('spreadOf', () => {
	it('puts the first page after the spine, then each even page before it, each odd one after', () => {
		expect([0, 1, 2, 3, 4].map(spreadOf)).toEqual([
			{ spread: 0, side: 1 },
			{ spread: 1, side: 0 },
			{ spread: 1, side: 1 },
			{ spread: 2, side: 0 },
			{ spread: 2, side: 1 },
		])
	})

	it('agrees with spreadCount on the last page’s spread', () => {
		for (const count of [1, 2, 3, 8, 9]) {
			expect(spreadOf(count - 1).spread).toBe(spreadCount(count) - 1)
		}
	})
})

describe('ringCount', () => {
	it('puts a ring every 12 mm along a left spine, the page’s height', () => {
		expect(ringCount({ ...A4_PORTRAIT, spine: 'left' })).toBe(24)
		expect(ringCount({ paperSize: 'a4', orientation: 'landscape', spine: 'left' })).toBe(17)
	})

	it('puts them along the page’s width for a top spine', () => {
		expect(ringCount({ ...A4_PORTRAIT, spine: 'top' })).toBe(17)
	})
})

describe('spreadDimensions', () => {
	it('sets two pages side by side across the binding for a left spine', () => {
		expect(spreadDimensions({ ...A4_PORTRAIT, spine: 'left' })).toEqual({
			width: 2 * 210 + BINDING_WIDTH,
			height: 297,
		})
	})

	it('stacks them for a top spine', () => {
		expect(spreadDimensions({ ...A4_PORTRAIT, spine: 'top' })).toEqual({
			width: 210,
			height: 2 * 297 + BINDING_WIDTH,
		})
	})

	it('follows the orientation', () => {
		expect(
			spreadDimensions({ paperSize: 'a5', orientation: 'landscape', spine: 'left' }),
		).toEqual({
			width: 2 * 210 + BINDING_WIDTH,
			height: 148,
		})
	})
})
