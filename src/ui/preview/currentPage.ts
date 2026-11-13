/** A box on screen, in px from the window's top left corner, as `getBoundingClientRect` gives. */
export interface ScreenRect {
	left: number
	top: number
	right: number
	bottom: number
}

/** An edge-to-edge span on one axis, in px. */
export interface Span {
	start: number
	end: number
}

/**
 * The index of the page showing the most of itself in `view`, the first on a tie, so a page gone
 * to stays current when the next ones fit in the view too; 0 when none shows.
 */
export function mostVisiblePage(view: ScreenRect, pages: readonly ScreenRect[]): number {
	let best = 0
	let bestArea = -1
	pages.forEach((page, index) => {
		const width = Math.min(page.right, view.right) - Math.max(page.left, view.left)
		const height = Math.min(page.bottom, view.bottom) - Math.max(page.top, view.top)
		const visible = Math.max(width, 0) * Math.max(height, 0)
		if (visible > bestArea) {
			best = index
			bestArea = visible
		}
	})
	return best
}

/**
 * How far to scroll across to show `page` in `view`: none when it fits, else as little as brings
 * it in, its left edge first when it is wider than the view.
 */
export function horizontalScroll(page: Span, view: Span): number {
	if (page.start < view.start) return page.start - view.start
	if (page.end > view.end) return Math.min(page.end - view.end, page.start - view.start)
	return 0
}
