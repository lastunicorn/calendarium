import type { CSSProperties } from 'react'
import type { FillAlignment } from '../options'
import type { GenkoYoshiFill } from '../pages'
import styles from './GenkoYoshi.module.css'

/** The class setting the grid across the page, per alignment. */
const ALIGN_CLASSES: Record<FillAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

/** The width of the grid's lines, in mm. */
const LINE_WIDTH = 0.2

/** The inline style of the grid, with its sizes as custom properties the stylesheet sizes it by. */
type GenkoYoshiStyle = CSSProperties &
	Record<'--square-size' | '--column-gap' | '--line-width', string>

/**
 * The columns' outline, a `clip-path` keeping the horizontal lines off the gaps between them: a
 * comb whose teeth run down each column, from the middle of its left line to the middle of its
 * right one, joined along the top edge, where the comb has no height.
 */
function columnsClipPath({ columns, size, gap }: GenkoYoshiFill): string {
	const teeth = Array.from({ length: columns }, (_, index) => {
		const left = index * (size + gap) + LINE_WIDTH / 2
		const right = left + size
		return `${left}mm 0, ${left}mm 100%, ${right}mm 100%, ${right}mm 0`
	})
	return `polygon(${teeth.join(', ')})`
}

interface GenkoYoshiProps {
	/** The grid as `planDayPages` plans it. */
	fill: GenkoYoshiFill
}

/**
 * A genkō yōshi grid filling the area left under a day's header, set across it per alignment: columns of
 * squares with a blank between them. A layer of rows draws the horizontal lines, cut to the
 * columns, under one of columns drawing the vertical ones: a few dozen elements a sheet rather
 * than one per square, each row and column also drawing the guide through its middle. The grid is
 * cut to the whole squares that fit.
 */
export function GenkoYoshi({ fill }: GenkoYoshiProps) {
	const style: GenkoYoshiStyle = {
		'--square-size': `${fill.size}mm`,
		'--column-gap': `${fill.gap}mm`,
		'--line-width': `${LINE_WIDTH}mm`,
	}
	return (
		<div className={`${styles.genkoYoshi} ${ALIGN_CLASSES[fill.align]}`} style={style}>
			<div className={fill.guides ? `${styles.grid} ${styles.guides}` : styles.grid}>
				<div className={styles.rows} style={{ clipPath: columnsClipPath(fill) }}>
					{Array.from({ length: fill.rows }, (_, index) => (
						// The rows are identical and never reorder, so the index is the key.
						<div key={index} className={styles.row} />
					))}
				</div>
				<div className={styles.columns}>
					{Array.from({ length: fill.columns }, (_, index) => (
						<div key={index} className={styles.column} />
					))}
				</div>
			</div>
		</div>
	)
}
