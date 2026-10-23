import { type RefObject, useLayoutEffect, useState } from 'react'
import type { Size } from '../../preferences/zoom'

interface ScrollAreaSize extends Size {
	/** The width of its vertical scrollbar, in px; 0 when it has none or it overlays the content. */
	scrollbarWidth: number
}

/** The room inside `element`'s padding and scrollbars, in px. */
function measure(element: HTMLElement): ScrollAreaSize {
	const style = getComputedStyle(element)
	return {
		width: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
		height:
			element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
		scrollbarWidth: element.offsetWidth - element.clientWidth,
	}
}

function sameSize(a: ScrollAreaSize, b: ScrollAreaSize): boolean {
	return a.width === b.width && a.height === b.height && a.scrollbarWidth === b.scrollbarWidth
}

/**
 * The room a scrolling element gives its content, followed as it is resized and as its scrollbar
 * comes and goes. Measured before the first paint, so what is sized from it doesn't jump.
 */
export function useScrollAreaSize(ref: RefObject<HTMLElement | null>): ScrollAreaSize {
	const [size, setSize] = useState<ScrollAreaSize>({ width: 0, height: 0, scrollbarWidth: 0 })

	useLayoutEffect(() => {
		const element = ref.current
		if (element === null) return
		function update() {
			const measured = measure(element!)
			setSize((current) => (sameSize(current, measured) ? current : measured))
		}
		update()
		const observer = new ResizeObserver(update)
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref])

	return size
}
