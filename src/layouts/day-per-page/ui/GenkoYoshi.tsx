import type { CSSProperties } from 'react'
import type { FillAlignment, GenkoYoshiFurigana } from '../options'
import type { GenkoYoshiFill } from '../pages'
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

/** The width of the grid's lines, in mm. */
const LINE_WIDTH = 0.2

/** The inline style of the grid, with its sizes as custom properties the stylesheet sizes it by. */
type GenkoYoshiStyle = CSSProperties &
	Record<
		| '--square-size'
		| '--column-gap'
		| '--furigana-width'
		| '--furigana-height'
		| '--line-width',
		string
	>

/** The width and height of a square with its furigana strip, in mm. */
function cellSize({ size, furigana, furiganaSize }: GenkoYoshiFill) {
	return {
		width: size + (furigana === 'right' ? furiganaSize : 0),
		height: size + (furigana === 'top' ? furiganaSize : 0),
	}
}

/**
 * The columns' outline, a `clip-path` keeping the horizontal lines off the gaps between them: a
 * comb whose teeth run down each column, from the middle of its left line to the middle of its
 * right one, joined along the top edge, where the comb has no height.
 */
function columnsClipPath(fill: GenkoYoshiFill): string {
	const { width } = cellSize(fill)
	const teeth = Array.from({ length: fill.columns }, (_, index) => {
		const left = index * (width + fill.gap) + LINE_WIDTH / 2
		const right = left + width
		return `${left}mm 0, ${left}mm 100%, ${right}mm 100%, ${right}mm 0`
	})
	return `polygon(${teeth.join(', ')})`
}

/** CSS pixels, an SVG's user units, per mm. */
const PX_PER_MM = 96 / 25.4

/** A length in mm as an SVG path's user units, rounded to a hundredth. */
function px(mm: number): number {
	return Math.round(mm * PX_PER_MM * 100) / 100
}

/** The guides' path of each grid, shared by every day's sheets, which share their fill. */
const guidePaths = new WeakMap<GenkoYoshiFill, string>()

/**
 * The guides' path: through the middle of each square, not its strip, from one of its lines to the
 * other, across and down. A column's squares touch without a top strip, so one line runs down
 * them all.
 */
function guidePath(fill: GenkoYoshiFill): string {
	const cached = guidePaths.get(fill)
	if (cached !== undefined) return cached
	const { size, rows, columns } = fill
	const { width, height } = cellSize(fill)
	const strip = fill.furigana === 'top' ? fill.furiganaSize : 0
	const segments: string[] = []
	for (let column = 0; column < columns; column++) {
		// The square's lines sit on the middles of the rows' and columns' borders.
		const left = column * (width + fill.gap) + LINE_WIDTH / 2
		for (let row = 0; row < rows; row++) {
			const top = row * height + strip + LINE_WIDTH / 2
			segments.push(`M${px(left)} ${px(top + size / 2)}h${px(size)}`)
			if (strip > 0 || row === 0) {
				const length = strip > 0 ? size : rows * size
				segments.push(`M${px(left + size / 2)} ${px(top)}v${px(length)}`)
			}
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
 * columns of squares, each with its furigana strip if any, with a blank between them. A layer of
 * rows draws the horizontal lines, cut to the columns, under one of columns drawing the vertical
 * ones: a few dozen elements a sheet rather than one per square, each row or column also drawing
 * the line between its squares and their strips. The grid is cut to the whole squares that fit.
 */
export function GenkoYoshi({ fill }: GenkoYoshiProps) {
	const style: GenkoYoshiStyle = {
		'--square-size': `${fill.size}mm`,
		'--column-gap': `${fill.gap}mm`,
		'--furigana-width': `${fill.furigana === 'right' ? fill.furiganaSize : 0}mm`,
		'--furigana-height': `${fill.furigana === 'top' ? fill.furiganaSize : 0}mm`,
		'--line-width': `${LINE_WIDTH}mm`,
	}
	const furiganaClass = FURIGANA_CLASSES[fill.furigana]
	return (
		<div className={`${styles.genkoYoshi} ${ALIGN_CLASSES[fill.align]}`} style={style}>
			<div className={furiganaClass ? `${styles.grid} ${furiganaClass}` : styles.grid}>
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
				{fill.guides && <Guides fill={fill} />}
			</div>
		</div>
	)
}
