import { describe, expect, it } from 'vitest'
import { zoomedIn, zoomedOut, zoomScale } from './zoom'

const SHEET = { width: 200, height: 300 }

describe('preview zoom', () => {
	it('draws a level at its own scale, whatever the preview’s size', () => {
		expect(zoomScale(100, SHEET, { width: 50, height: 50 })).toBe(1)
		expect(zoomScale(150, SHEET, { width: 50, height: 50 })).toBe(1.5)
	})

	it('fits the sheet’s width, or the whole sheet, in the preview', () => {
		const area = { width: 300, height: 360 }
		expect(zoomScale('fit-width', SHEET, area)).toBe(1.5)
		expect(zoomScale('fit-page', SHEET, area)).toBe(1.2)
	})

	it('keeps a fit between the lowest and the highest levels', () => {
		expect(zoomScale('fit-width', SHEET, { width: 0, height: 0 })).toBe(0.25)
		expect(zoomScale('fit-page', SHEET, { width: 2000, height: 3000 })).toBe(2)
	})

	it('steps to the level either side of a level', () => {
		expect(zoomedIn(1)).toBe(125)
		expect(zoomedOut(1)).toBe(75)
	})

	it('steps from a fit to the level either side of where it came to', () => {
		expect(zoomedIn(0.83)).toBe(100)
		expect(zoomedOut(0.83)).toBe(75)
		// A fit landing next to a level steps past it.
		expect(zoomedIn(0.9999)).toBe(125)
	})

	it('stops at the lowest and the highest levels', () => {
		expect(zoomedOut(0.25)).toBeNull()
		expect(zoomedIn(2)).toBeNull()
	})
})
