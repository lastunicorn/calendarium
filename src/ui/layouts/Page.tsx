import { useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

import { pageDimensions, type PageSetup } from '../../core/paper'
import styles from './Page.module.css'
import { PageOverflowContext } from './pageOverflow'
import { useOverflow } from './useOverflow'

/** The inline style, with the margins as custom properties the stylesheet can swap. */
type PageStyle = CSSProperties &
	Record<'--margin-top' | '--margin-right' | '--margin-bottom' | '--margin-left', string>

interface PageProps {
	setup: PageSetup
	/** Its content; none for a blank page. */
	children?: ReactNode
}

/**
 * One sheet of paper, sized in mm so the preview matches print; the margins become its padding.
 * Content that doesn't fit inside the margins would be cut off silently, so the preview marks it,
 * and tells the `Preview` (`PageOverflowContext`), which announces how many pages don't fit.
 * With mirrored margins, the stylesheet swaps the margins on either side of the spine (left and
 * right, or top and bottom) of every even page. Each page prints on its own sheet, except in a
 * booklet, whose `Booklet` places two on each side of a sheet.
 */
export function Page({ setup, children }: PageProps) {
	const ref = useRef<HTMLElement>(null)
	const overflows = useOverflow(ref)
	const reportOverflow = useContext(PageOverflowContext)
	// Keyed by the ref, which lasts as long as the page; withdrawn once it fits or is gone.
	useEffect(() => {
		if (!overflows) return
		reportOverflow(ref, true)
		return () => reportOverflow(ref, false)
	}, [reportOverflow, overflows])
	const { width, height } = pageDimensions(setup.paperSize, setup.orientation)
	const { top, right, bottom, left } = setup.margins
	const style: PageStyle = {
		width: `${width}mm`,
		height: `${height}mm`,
		'--margin-top': `${top}mm`,
		'--margin-right': `${right}mm`,
		'--margin-bottom': `${bottom}mm`,
		'--margin-left': `${left}mm`,
	}
	const classes = [styles.page]
	if (!setup.booklet) classes.push(styles.ownSheet)
	if (setup.mirrorMargins)
		classes.push(setup.spine === 'left' ? styles.mirroredSides : styles.mirroredEnds)
	const className = classes.join(' ')
	return (
		<section ref={ref} className={className} style={style}>
			{children}
			{overflows && (
				<p className={styles.overflowBadge}>
					Content doesn't fit on this page: try smaller margins or another paper size
				</p>
			)}
		</section>
	)
}
