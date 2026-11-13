import type { CSSProperties } from 'react'

import { mmToPx } from '../../../../core/paper'
import type { FillAlignment, GenkoYoshiDirection, GenkoYoshiFurigana } from '../../options'
import type { GenkoYoshiFill } from '../../pages'
import styles from './GenkoYoshi.module.css'

/** The class setting the grid across the page, per alignment. */
const ALIGN_CLASSES: Record<FillAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

/** The class drawing the line between each square and its furigana strip, if it has one. */
const FURIGANA_CLASSES: Record<GenkoYoshiFurigana, string | undefined> = {
	none: undefined,
	top: styles.furiganaTop,
	right: styles.furiganaRight,
}

/** The width of the grid's lines, in mm, for the path math: `--rule-light` in `index.css`. */
const LINE_WIDTH = 0.2

/** The class laying the grid out in columns, a gap between them, or in rows, per direction. */
const DIRECTION_CLASSES: Record<GenkoYoshiDirection, string> = {
	vertical: styles.vertical,
	horizontal: styles.horizontal,
}

/** The inline style of the grid, with its sizes as custom properties the stylesheet sizes it by. */
type GenkoYoshiStyle = CSSProperties &
	Record<
		| '--square-size'
		| '--column-gap'
		| '--row-gap'
		| '--furigana-width'
		| '--furigana-height'
		| '--line-width',
		string
	>

/**
 * Where a grid's cells (a square with its furigana strip, if any) sit, in mm: their size, and the
 * distance from one column's or row's to the next, a gap apart between columns written vertically
 * or between rows written horizontally.
 */
function cellLayout({ size, gap, direction, furigana, furiganaSize }: GenkoYoshiFill) {
	const width = size + (furigana === 'right' ? furiganaSize : 0)
	const height = size + (furigana === 'top' ? furiganaSize : 0)
	return {
		width,
		height,
		columnStep: width + (direction === 'vertical' ? gap : 0),
		rowStep: height + (direction === 'horizontal' ? gap : 0),
	}
}

/**
 * The outline of the columns written vertically, or of the rows written horizontally, a
 * `clip-path` keeping the lines across them off the gaps between them: one rectangle along each,
 * from the middle of one of its lines to the middle of the other, the whole grid long. Each is a
 * subpath of its own: a single polygon joining them along the grid's edge, with no height there,
 * prints a line across the gaps, as a printer fills every device pixel a clip path touches.
 */
function bandsClipPath(fill: GenkoYoshiFill): string {
	const { width, height, columnStep, rowStep } = cellLayout(fill)
	const vertical = fill.direction === 'vertical'
	// The grid's length along the bands: their cells, with the far line.
	const length = mmToPx((vertical ? fill.rows * rowStep : fill.columns * columnStep) + LINE_WIDTH)
	const breadth = mmToPx(vertical ? width : height)
	const bands = Array.from({ length: vertical ? fill.columns : fill.rows }, (_, index) => {
		const start = mmToPx(index * (vertical ? columnStep : rowStep) + LINE_WIDTH / 2)
		return vertical
			? `M${start} 0h${breadth}v${length}h${-breadth}Z`
			: `M0 ${start}v${breadth}h${length}v${-breadth}Z`
	})
	return `path('${bands.join('')}')`
}

/** The guides' path of each grid, shared by every day's sheets, which share their fill. */
const guidePaths = new WeakMap<GenkoYoshiFill, string>()

/** The guides' path: through the middle of each square, not its strip, across and down. */
function guidePath(fill: GenkoYoshiFill): string {
	const cached = guidePaths.get(fill)
	if (cached !== undefined) return cached
	const { size } = fill
	const { columnStep, rowStep } = cellLayout(fill)
	const strip = fill.furigana === 'top' ? fill.furiganaSize : 0
	const segments: string[] = []
	for (let column = 0; column < fill.columns; column++) {
		// The square's lines sit on the middles of the rows' and columns' borders.
		const left = column * columnStep + LINE_WIDTH / 2
		for (let row = 0; row < fill.rows; row++) {
			const top = row * rowStep + strip + LINE_WIDTH / 2
			segments.push(`M${mmToPx(left)} ${mmToPx(top + size / 2)}h${mmToPx(size)}`)
			segments.push(`M${mmToPx(left + size / 2)} ${mmToPx(top)}v${mmToPx(size)}`)
		}
	}
	const path = segments.join('')
	guidePaths.set(fill, path)
	return path
}

interface GuidesProps {
	fill: GenkoYoshiFill
}

/**
 * The dotted lines halving each square across and down: one SVG path rather than drawn by the rows
 * and columns, whose lines would run on through the furigana strips. A pattern would draw it with
 * fewer segments, but Chrome prints a pattern as a blurry image.
 */
function Guides({ fill }: GuidesProps) {
	return (
		<svg className={styles.guides} aria-hidden="true">
			<path className={styles.guide} d={guidePath(fill)} />
		</svg>
	)
}

interface GenkoYoshiProps {
	/** The grid as `planDayPages` plans it. */
	fill: GenkoYoshiFill
}

/**
 * A genkō yōshi grid filling the area left under a day's header, set across it per alignment:
 * columns of squares, or rows of them written horizontally, each with its furigana strip if any,
 * with a blank between them. A layer of rows draws the horizontal lines and one of columns the
 * vertical ones, the lines across the columns (or rows) cut to them: a few dozen elements a sheet
 * rather than one per square, each row or column also drawing the line between its squares and
 * their strips. The grid is cut to the whole squares that fit.
 */
export function GenkoYoshi({ fill }: GenkoYoshiProps) {
	const vertical = fill.direction === 'vertical'
	const style: GenkoYoshiStyle = {
		'--square-size': `${fill.size}mm`,
		'--column-gap': `${vertical ? fill.gap : 0}mm`,
		'--row-gap': `${vertical ? 0 : fill.gap}mm`,
		'--furigana-width': `${fill.furigana === 'right' ? fill.furiganaSize : 0}mm`,
		'--furigana-height': `${fill.furigana === 'top' ? fill.furiganaSize : 0}mm`,
		'--line-width': `${LINE_WIDTH}mm`,
	}
	const clip = { clipPath: bandsClipPath(fill) }
	const gridClasses = [
		styles.grid,
		DIRECTION_CLASSES[fill.direction],
		FURIGANA_CLASSES[fill.furigana],
	]
	return (
		<div className={`${styles.genkoYoshi} ${ALIGN_CLASSES[fill.align]}`} style={style}>
			<div className={gridClasses.filter(Boolean).join(' ')}>
				<div className={styles.rows} style={vertical ? clip : undefined}>
					{Array.from({ length: fill.rows }, (_, index) => (
						// The rows are identical and never reorder, so the index is the key.
						<div key={index} className={styles.row} />
					))}
				</div>
				<div className={styles.columns} style={vertical ? undefined : clip}>
					{Array.from({ length: fill.columns }, (_, index) => (
						<div key={index} className={styles.column} />
					))}
				</div>
				{fill.guides && <Guides fill={fill} />}
			</div>
		</div>
	)
}
