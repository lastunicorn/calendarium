import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Whether `ref`'s content is larger than its box (it would be clipped). Checked after each render
 * and when the element scrolls into view, but only while it is on screen: reading the size of an
 * offscreen page would force the layout that `content-visibility: auto` skips.
 */
export function useOverflow(ref: RefObject<HTMLElement | null>): boolean {
	const [overflows, setOverflows] = useState(false)
	const onScreen = useRef(false)

	const check = useCallback(() => {
		const element = ref.current
		if (element === null || !onScreen.current) return
		// Sizes in mm are rounded to whole pixels, so allow one pixel of difference.
		setOverflows(
			element.scrollHeight > element.clientHeight + 1 ||
				element.scrollWidth > element.clientWidth + 1,
		)
	}, [ref])

	useEffect(() => {
		const element = ref.current
		if (element === null) return
		const observer = new IntersectionObserver(([entry]) => {
			onScreen.current = entry.isIntersecting
			check()
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref, check])

	// No dependencies: the content may have changed on any render. A repeated value doesn't re-render.
	useLayoutEffect(check)

	return overflows
}
