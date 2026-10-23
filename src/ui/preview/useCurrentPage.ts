import { type RefObject, useEffect, useRef, useState } from 'react'

/** A page gone to from the indicator, kept as the current one until the view scrolls away. */
interface PinnedPage {
	index: number
	scrollTop: number
	scrollLeft: number
}

/** The drawn pages, in reading order: `Page`s are the only sections, a booklet's blank ones last. */
function pageElements(pages: HTMLElement): HTMLElement[] {
	return [...pages.querySelectorAll('section')]
}

/**
 * The index of the page showing the most of itself in `area`'s visible part, the first on a tie,
 * so a page gone to stays current when the next ones fit in the view too.
 */
function mostVisiblePage(area: HTMLElement, pages: HTMLElement[]): number {
	const view = area.getBoundingClientRect()
	const right = view.left + area.clientWidth
	const bottom = view.top + area.clientHeight
	let best = 0
	let bestArea = -1
	pages.forEach((page, index) => {
		const rect = page.getBoundingClientRect()
		const width = Math.min(rect.right, right) - Math.max(rect.left, view.left)
		const height = Math.min(rect.bottom, bottom) - Math.max(rect.top, view.top)
		const visible = Math.max(width, 0) * Math.max(height, 0)
		if (visible > bestArea) {
			best = index
			bestArea = visible
		}
	})
	return best
}

/**
 * The pages drawn in `pagesRef`, counted as they change, and the one currently shown in the
 * scrolling `areaRef`, followed as it scrolls, is resized or zooms. `goToPage` scrolls a page's
 * top to the top of the view, horizontally only as far as needed to show it.
 */
export function useCurrentPage(
	areaRef: RefObject<HTMLElement | null>,
	pagesRef: RefObject<HTMLElement | null>,
) {
	const [count, setCount] = useState(0)
	const [current, setCurrent] = useState(0)
	const pinned = useRef<PinnedPage | null>(null)

	useEffect(() => {
		const area = areaRef.current
		const pagesBox = pagesRef.current
		if (area === null || pagesBox === null) return

		function update() {
			const pages = pageElements(pagesBox!)
			setCount(pages.length)
			const pin = pinned.current
			if (
				pin !== null &&
				pin.index < pages.length &&
				pin.scrollTop === area!.scrollTop &&
				pin.scrollLeft === area!.scrollLeft
			) {
				setCurrent(pin.index)
				return
			}
			pinned.current = null
			setCurrent(mostVisiblePage(area!, pages))
		}

		update()
		// Browsers send scroll and resize events at most once a frame, so each is followed as it comes.
		area.addEventListener('scroll', update, { passive: true })
		const resizeObserver = new ResizeObserver(update)
		resizeObserver.observe(area)
		resizeObserver.observe(pagesBox)
		const mutationObserver = new MutationObserver(update)
		mutationObserver.observe(pagesBox, { childList: true, subtree: true })
		return () => {
			area.removeEventListener('scroll', update)
			resizeObserver.disconnect()
			mutationObserver.disconnect()
		}
	}, [areaRef, pagesRef])

	function goToPage(index: number) {
		const area = areaRef.current
		const pagesBox = pagesRef.current
		if (area === null || pagesBox === null) return
		const page = pageElements(pagesBox)[index]
		if (page === undefined) return
		const view = area.getBoundingClientRect()
		const rect = page.getBoundingClientRect()
		const style = getComputedStyle(area)
		// Inside the padding, as the first page lies at the top.
		const left = view.left + parseFloat(style.paddingLeft)
		const right = view.left + area.clientWidth - parseFloat(style.paddingRight)
		area.scrollTop += rect.top - view.top - parseFloat(style.paddingTop)
		if (rect.left < left) area.scrollLeft += rect.left - left
		else if (rect.right > right)
			area.scrollLeft += Math.min(rect.right - right, rect.left - left)
		pinned.current = { index, scrollTop: area.scrollTop, scrollLeft: area.scrollLeft }
		setCurrent(index)
	}

	return { count, current, goToPage }
}
