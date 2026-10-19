import { describe, expect, it } from 'vitest'
import { contentBox, pageDimensions, pageSizeCss, PAPER_SIZES, PAPERS } from './paper'

describe('pageDimensions', () => {
	it('keeps portrait dimensions as listed', () => {
		expect(pageDimensions('a4', 'portrait')).toEqual({ width: 210, height: 297 })
		expect(pageDimensions('letter', 'portrait')).toEqual({ width: 215.9, height: 279.4 })
	})

	it('swaps width and height for landscape', () => {
		expect(pageDimensions('a3', 'landscape')).toEqual({ width: 420, height: 297 })
	})

	it('lists every paper size taller than wide', () => {
		for (const size of PAPER_SIZES)
			expect(PAPERS[size].height).toBeGreaterThan(PAPERS[size].width)
	})
})

describe('pageSizeCss', () => {
	it('combines the CSS paper name and orientation', () => {
		expect(pageSizeCss('a4', 'portrait')).toBe('A4 portrait')
		expect(pageSizeCss('letter', 'landscape')).toBe('letter landscape')
	})
})

describe('contentBox', () => {
	it('subtracts the margins from the sheet as it lies', () => {
		const margins = { top: 10, right: 15, bottom: 20, left: 5 }
		expect(contentBox({ paperSize: 'a4', orientation: 'portrait', margins })).toEqual({
			width: 190,
			height: 267,
		})
		expect(contentBox({ paperSize: 'a4', orientation: 'landscape', margins })).toEqual({
			width: 277,
			height: 180,
		})
	})
})
