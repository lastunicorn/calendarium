import { type ReactNode, useRef } from 'react'
import type { PageSetup } from '../../config/CalendarConfig'
import { pageDimensions } from '../../core/paper'
import styles from './Page.module.css'
import { useOverflow } from './useOverflow'

interface PageProps {
	setup: PageSetup
	children: ReactNode
}

/**
 * One sheet of paper, sized in mm so the preview matches print; the margins become its padding.
 * Content that doesn't fit inside the margins would be cut off silently, so the preview marks it.
 */
export function Page({ setup, children }: PageProps) {
	const ref = useRef<HTMLElement>(null)
	const overflows = useOverflow(ref)
	const { width, height } = pageDimensions(setup.paperSize, setup.orientation)
	const { top, right, bottom, left } = setup.margins
	return (
		<section
			ref={ref}
			className={styles.page}
			style={{
				width: `${width}mm`,
				height: `${height}mm`,
				padding: `${top}mm ${right}mm ${bottom}mm ${left}mm`,
			}}
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
