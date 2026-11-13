import { useCallback, useEffect, useRef, useState } from 'react'

import type { ReportPageOverflow } from '../layouts/pageOverflow'

/** How long the count waits for the pages to settle, so typing a margin isn't announced digit by digit. */
const SETTLE_MS = 500

/**
 * The number of pages known not to fit inside their margins, as they report it through `report`,
 * updated once the reports settle. A page is checked only while it is on screen, so one never
 * scrolled to isn't counted until it is.
 */
export function useOverflowCount(): { count: number; report: ReportPageOverflow } {
	const [count, setCount] = useState(0)
	const overflowing = useRef(new Set<object>())
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const report = useCallback<ReportPageOverflow>((page, overflows) => {
		if (overflows) overflowing.current.add(page)
		else overflowing.current.delete(page)
		clearTimeout(timer.current)
		timer.current = setTimeout(() => setCount(overflowing.current.size), SETTLE_MS)
	}, [])

	useEffect(() => () => clearTimeout(timer.current), [])

	return { count, report }
}
