import { useEffect, useRef, useState, type RefObject } from 'react'

import { horizontalScroll, mostVisiblePage, type ScreenRect } from './currentPage'

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

/** The part of `area` that shows its pages: from its top left corner, its scroll bars aside. */
function viewRect(area: HTMLElement): ScreenRect {
	const { left, top } = area.getBoundingClientRect()
	return { left, top, right: left + area.clientWidth, bottom: top + area.clientHeight }
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

		const update = () => {
			const pages = pageElements(pagesBox)
			setCount(pages.length)
			const pin = pinned.current
			if (
				pin !== null &&
				pin.index < pages.length &&
				pin.scrollTop === area.scrollTop &&
				pin.scrollLeft === area.scrollLeft
			) {
				setCurrent(pin.index)
				return
			}
			pinned.current = null
			setCurrent(
				mostVisiblePage(
					viewRect(area),
					pages.map((page) => page.getBoundingClientRect()),
				),
			)
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
		area.scrollLeft += horizontalScroll(
			{ start: rect.left, end: rect.right },
			{ start: left, end: right },
		)
		pinned.current = { index, scrollTop: area.scrollTop, scrollLeft: area.scrollLeft }
		setCurrent(index)
	}

	return { count, current, goToPage }
}
