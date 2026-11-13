import { describe, expect, it } from 'vitest'

import { horizontalScroll, mostVisiblePage, type ScreenRect } from './currentPage'

const VIEW: ScreenRect = { left: 0, top: 0, right: 400, bottom: 600 }

/** A page 300 px wide and 400 high, its top left corner at `left`, `top`. */
function page(left: number, top: number): ScreenRect {
	return { left, top, right: left + 300, bottom: top + 400 }
}

describe('mostVisiblePage', () => {
	it('picks the page showing the most of itself', () => {
		// 100 px of the first shows, 400 of the second, 100 of the third.
		expect(mostVisiblePage(VIEW, [page(0, -300), page(0, 100), page(0, 500)])).toBe(1)
	})

	it('picks the first of the pages showing as much', () => {
		const pages = [page(0, 0), page(0, 1000), page(0, 100), page(0, 150)]
		expect(mostVisiblePage(VIEW, [page(0, 600), ...pages])).toBe(1)
	})

	it('counts only what shows across too', () => {
		// Side by side: 100 px of the first page's width shows, 200 of the second's.
		expect(mostVisiblePage(VIEW, [page(300, 0), page(-100, 0)])).toBe(1)
	})

	it('picks the first page when none shows, or there is none', () => {
		expect(mostVisiblePage(VIEW, [page(0, 700), page(0, 1200)])).toBe(0)
		expect(mostVisiblePage(VIEW, [])).toBe(0)
	})
})

describe('horizontalScroll', () => {
	const view = { start: 20, end: 420 }

	it('scrolls nowhere when the page shows across', () => {
		expect(horizontalScroll({ start: 20, end: 420 }, view)).toBe(0)
		expect(horizontalScroll({ start: 100, end: 300 }, view)).toBe(0)
	})

	it('scrolls back to a page cut on the left', () => {
		expect(horizontalScroll({ start: -80, end: 220 }, view)).toBe(-100)
	})

	it('scrolls on just far enough to a page cut on the right', () => {
		expect(horizontalScroll({ start: 300, end: 600 }, view)).toBe(180)
	})

	it('brings a page wider than the view to its left edge', () => {
		expect(horizontalScroll({ start: 100, end: 900 }, view)).toBe(80)
	})
})
