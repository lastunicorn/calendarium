import type { CSSProperties } from 'react'
import { mmToPx } from '../../../../core/paper'
import type { DayFill } from '../../pages'
import styles from './Dots.module.css'
import { squareAreaClass } from './squareArea'

/** The diameter of a dot, in mm. */
const DOT_SIZE = 0.5

/** The inline style of the dots, with their spacing and size as custom properties the stylesheet sizes the grid by. */
type DotsStyle = CSSProperties & Record<'--square-size' | '--dot-size', string>

/** The `dots` fill as `planDayPages` plans it. */
type DotsFill = Extract<DayFill, { kind: 'dots' }>

/** The dots' path of each grid, shared by every day's sheets, which share their fill. */
const dotPaths = new WeakMap<DotsFill, string>()

/**
 * The dots' path: a segment of no length at each corner of the squares, which its round caps draw
 * as a dot, the first dot's edge meeting the grid's.
 */
function dotPath(fill: DotsFill): string {
	const cached = dotPaths.get(fill)
	if (cached !== undefined) return cached
	const radius = DOT_SIZE / 2
	const segments: string[] = []
	for (let row = 0; row <= fill.rows; row++) {
		const y = mmToPx(radius + row * fill.size)
		for (let column = 0; column <= fill.columns; column++) {
			segments.push(`M${mmToPx(radius + column * fill.size)} ${y}h0`)
		}
	}
	const path = segments.join('')
	dotPaths.set(fill, path)
	return path
}

interface DotsProps {
	fill: DotsFill
}

/**
 * Dots at the corners of the squares filling the area left under a day's header, drawn by one SVG
 * path rather than one element per dot. A pattern would draw them with a single tile, but Chrome
 * prints a pattern as a blurry image. The grid, sized in CSS, is cut to the whole squares that
 * fit, clipping the dots past them.
 */
export function Dots({ fill }: DotsProps) {
	const style: DotsStyle = {
		'--square-size': `${fill.size}mm`,
		'--dot-size': `${DOT_SIZE}mm`,
	}
	return (
		<div className={squareAreaClass(fill.align)} style={style}>
			<svg className={styles.dotGrid} aria-hidden="true">
				<path className={styles.dots} d={dotPath(fill)} />
			</svg>
		</div>
	)
}
