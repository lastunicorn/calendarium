import { describe, expect, it } from 'vitest'
import {
	contentBox,
	margins,
	normalizePage,
	type PageSetup,
	pageDimensions,
	pageSizeCss,
	PAPER_SIZES,
	PAPERS,
} from './paper'

describe('pageDimensions', () => {
	it('keeps portrait dimensions as listed', () => {
		expect(pageDimensions('a4', 'portrait')).toEqual({ width: 210, height: 297 })
		expect(pageDimensions('letter', 'portrait')).toEqual({ width: 215.9, height: 279.4 })
	})

	it('swaps width and height for landscape', () => {
		expect(pageDimensions('a3', 'landscape')).toEqual({ width: 420, height: 297 })
		expect(pageDimensions('a5', 'landscape')).toEqual({ width: 210, height: 148 })
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

describe('normalizePage', () => {
	const page: PageSetup = {
		paperSize: 'a4',
		orientation: 'portrait',
		margins: { top: 10, right: 12, bottom: 14, left: 16 },
		equalMargins: false,
		mirrorMargins: false,
		spine: 'left',
	}

	it('leaves differing margins as they are without equal margins', () => {
		expect(normalizePage(page)).toBe(page)
	})

	it('turns equal margins off when the sides differ, keeping the margins', () => {
		expect(normalizePage({ ...page, equalMargins: true })).toEqual(page)
	})

	it('keeps equal margins when the sides are equal', () => {
		const equal = { ...page, equalMargins: true, margins: margins(8) }
		expect(normalizePage(equal)).toBe(equal)
	})

	it('turns equal margins off with mirrored margins, keeping the margins', () => {
		const mirrored = { ...page, margins: margins(8), mirrorMargins: true }
		expect(normalizePage({ ...mirrored, equalMargins: true })).toEqual(mirrored)
	})
})
