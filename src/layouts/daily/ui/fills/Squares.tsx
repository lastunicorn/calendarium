import type { CSSProperties } from 'react'

import type { DayFill } from '../../pages'
import { squareAreaClass } from './squareArea'
import styles from './Squares.module.css'

/** The inline style of the squares, with their side as a custom property the stylesheet sizes the grid by. */
type SquaresStyle = CSSProperties & Record<'--square-size', string>

interface SquaresProps {
	/** The grid as `planDayPages` plans it. */
	fill: Extract<DayFill, { kind: 'squares' }>
}

/**
 * A grid of squares filling the area left under a day's header: a layer of rows drawing the
 * horizontal lines over one of columns drawing the vertical ones, a few dozen elements a sheet
 * rather than one per square. The grid is cut to the whole squares that fit, so none is drawn in
 * part.
 */
export function Squares({ fill }: SquaresProps) {
	const style: SquaresStyle = { '--square-size': `${fill.size}mm` }
	return (
		<div className={squareAreaClass(fill.align)} style={style}>
			<div className={styles.squareGrid}>
				<div className={styles.squareRows}>
					{Array.from({ length: fill.rows }, (_, index) => (
						// The rows are identical and never reorder, so the index is the key.
						<div key={index} className={styles.squareRow} />
					))}
				</div>
				<div className={styles.squareColumns}>
					{Array.from({ length: fill.columns }, (_, index) => (
						<div key={index} className={styles.squareColumn} />
					))}
				</div>
			</div>
		</div>
	)
}
