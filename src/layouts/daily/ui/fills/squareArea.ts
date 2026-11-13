import type { FillAlignment } from '../../options'
import styles from './Squares.module.css'

/** The class setting the grid of squares across the page, per alignment. */
const FILL_ALIGN_CLASSES: Record<FillAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

/** The classes of the area left under a day's header that the squares, or their dots, are set across per `align`. */
export function squareAreaClass(align: FillAlignment): string {
	return `${styles.squares} ${FILL_ALIGN_CLASSES[align]}`
}
