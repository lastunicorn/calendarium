import type { ReactNode } from 'react'
import type { PageSetup } from '../../config/CalendarConfig'
import { pageDimensions } from '../../core/paper'
import styles from './Page.module.css'

interface PageProps {
	setup: PageSetup
	children: ReactNode
}

/** One sheet of paper, sized in mm so the preview matches print; the margins become its padding. */
export function Page({ setup, children }: PageProps) {
	const { width, height } = pageDimensions(setup.paperSize, setup.orientation)
	const { top, right, bottom, left } = setup.margins
	return (
		<section
			className={styles.page}
			style={{
				width: `${width}mm`,
				height: `${height}mm`,
				padding: `${top}mm ${right}mm ${bottom}mm ${left}mm`,
			}}
		>
			{children}
		</section>
	)
}
