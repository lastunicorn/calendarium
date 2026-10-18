import type { ReactNode } from 'react'
import type { Margins } from '../../config/CalendarConfig'
import { type Orientation, pageDimensions, type PaperSize } from '../../core/paper'
import styles from './Page.module.css'

interface PageProps {
	paperSize: PaperSize
	orientation: Orientation
	margins: Margins
	children: ReactNode
}

/** One sheet of paper, sized in mm so the preview matches print; `margins` become its padding. */
export function Page({ paperSize, orientation, margins, children }: PageProps) {
	const { width, height } = pageDimensions(paperSize, orientation)
	const { top, right, bottom, left } = margins
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
