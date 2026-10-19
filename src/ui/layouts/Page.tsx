import { type CSSProperties, type ReactNode, useRef } from 'react'
import type { PageSetup } from '../../config/CalendarConfig'
import { pageDimensions } from '../../core/paper'
import styles from './Page.module.css'
import { useOverflow } from './useOverflow'

/** The inline style, with the side margins as custom properties the stylesheet can swap. */
type PageStyle = CSSProperties & Record<'--margin-left' | '--margin-right', string>

interface PageProps {
	setup: PageSetup
	children: ReactNode
}

/**
 * One sheet of paper, sized in mm so the preview matches print; the margins become its padding.
 * Content that doesn't fit inside the margins would be cut off silently, so the preview marks it.
 * With mirrored margins, the stylesheet swaps the left and right margins of every even page.
 */
export function Page({ setup, children }: PageProps) {
	const ref = useRef<HTMLElement>(null)
	const overflows = useOverflow(ref)
	const { width, height } = pageDimensions(setup.paperSize, setup.orientation)
	const { top, right, bottom, left } = setup.margins
	const style: PageStyle = {
		width: `${width}mm`,
		height: `${height}mm`,
		paddingTop: `${top}mm`,
		paddingBottom: `${bottom}mm`,
		'--margin-left': `${left}mm`,
		'--margin-right': `${right}mm`,
	}
	return (
		<section
			ref={ref}
			className={setup.mirrorMargins ? `${styles.page} ${styles.mirrored}` : styles.page}
			style={style}
		>
			{children}
			{overflows && (
				<p className={styles.overflowBadge}>
					Content doesn't fit on this page: try smaller margins or another paper size
				</p>
			)}
		</section>
	)
}
