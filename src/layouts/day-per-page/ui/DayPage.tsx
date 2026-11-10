import { type CSSProperties, memo } from 'react'
import type { PageSetup } from '../../../core/paper'
import type { FillAlignment } from '../options'
import type { DayFill, DayPages } from '../pages'
import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import styles from './DayPage.module.css'
import { GenkoYoshi } from './GenkoYoshi'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { miniMonthSizeClass } from '../../../ui/layouts/miniMonthSize'
import { Page } from '../../../ui/layouts/Page'

/** The inline style of the squares, with their side as a custom property the stylesheet sizes the grid by. */
type SquaresStyle = CSSProperties & Record<'--square-size', string>

/** The class setting the grid of squares across the page, per alignment. */
const FILL_ALIGN_CLASSES: Record<FillAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

/** The diameter of a dot in the `dots` fill, in mm. */
const DOT_SIZE = 0.5

/** The inline style of the dots, with their spacing and size as custom properties the stylesheet sizes the grid by. */
type DotsStyle = CSSProperties & Record<'--square-size' | '--dot-size', string>

/** The `dots` fill as `planDayPages` plans it. */
type DotsFill = Extract<DayFill, { kind: 'dots' }>

/** CSS pixels, an SVG's user units, per mm. */
const PX_PER_MM = 96 / 25.4

/** A length in mm as an SVG path's user units, rounded to a hundredth. */
function px(mm: number): number {
	return Math.round(mm * PX_PER_MM * 100) / 100
}

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
		const y = px(radius + row * fill.size)
		for (let column = 0; column <= fill.columns; column++) {
			segments.push(`M${px(radius + column * fill.size)} ${y}h0`)
		}
	}
	const path = segments.join('')
	dotPaths.set(fill, path)
	return path
}

interface DotGridProps {
	fill: DotsFill
}

/**
 * Dots at the corners of the squares, drawn by one SVG path rather than one element per dot. A
 * pattern would draw them with a single tile, but Chrome prints a pattern as a blurry image. The
 * grid, sized in CSS, is cut to the whole squares that fit, clipping the dots past them.
 */
function DotGrid({ fill }: DotGridProps) {
	return (
		<svg className={styles.dotGrid} aria-hidden="true">
			<path className={styles.dots} d={dotPath(fill)} />
		</svg>
	)
}

interface DayLinesProps {
	fill: DayFill
}

/** The writing area filling a day's page under its header, or all of its second page. */
function DayLines({ fill }: DayLinesProps) {
	if (fill.kind === 'blank') {
		return null
	}
	if (fill.kind === 'ruled') {
		return (
			<div className={styles.ruled} style={{ gridAutoRows: `${fill.spacing}mm` }}>
				{Array.from({ length: fill.lines }, (_, index) => (
					// The lines are identical and never reorder, so the index is the key.
					<div key={index} className={styles.ruledLine} />
				))}
			</div>
		)
	}
	if (fill.kind === 'squares') {
		// A layer of rows drawing the horizontal lines over one of columns drawing the vertical
		// ones: a few dozen elements a sheet rather than one per square. The grid is cut to the
		// whole squares that fit, so none is drawn in part.
		const style: SquaresStyle = { '--square-size': `${fill.size}mm` }
		return (
			<div className={`${styles.squares} ${FILL_ALIGN_CLASSES[fill.align]}`} style={style}>
				<div className={styles.squareGrid}>
					<div className={styles.squareRows}>
						{Array.from({ length: fill.rows }, (_, index) => (
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
	if (fill.kind === 'dots') {
		const style: DotsStyle = {
			'--square-size': `${fill.size}mm`,
			'--dot-size': `${DOT_SIZE}mm`,
		}
		return (
			<div className={`${styles.squares} ${FILL_ALIGN_CLASSES[fill.align]}`} style={style}>
				<DotGrid fill={fill} />
			</div>
		)
	}
	if (fill.kind === 'genkoYoshi') {
		return <GenkoYoshi fill={fill} />
	}
	return (
		<div
			className={styles.schedule}
			style={{ gridTemplateRows: `repeat(${fill.hours.length}, 1fr)` }}
		>
			{fill.hours.map((hour) => (
				<div key={hour} className={styles.hour}>
					<span className={styles.hourLabel}>{hour}</span>
				</div>
			))}
		</div>
	)
}

interface DayFooterProps {
	/** Its height, in mm. */
	height: number
}

/** The empty bordered footer at the bottom of a day's sheet, under its fill. */
function DayFooter({ height }: DayFooterProps) {
	return <div className={styles.footer} style={{ height: `${height}mm` }} />
}

interface DayPageProps {
	/** The day as `planDayPages` plans it. */
	plan: DayPages
	setup: PageSetup
}

/**
 * One day's sheet, or two when the day spans a second one without a header. Memoized because a
 * year has 366 of them and an unchanged plan keeps its page objects.
 */
export const DayPage = memo(function DayPage({ plan, setup }: DayPageProps) {
	const { miniMonth, events } = plan
	const [firstFill, ...nextFills] = plan.fills
	const footer = plan.footerHeight !== undefined && <DayFooter height={plan.footerHeight} />
	return (
		<>
			<Page setup={setup}>
				<div className={styles.layout}>
					<div className={`${styles.top} ${miniMonthSizeClass(miniMonth?.size)}`}>
						<div className={styles.heading}>
							<CalendarHeader
								heading={plan.heading}
								subheading={plan.subheading}
								size="compact"
								align="left"
								highlight={plan.weekend}
								headingFontSize={plan.headingFontSize}
							/>
							{events.map((name, index) => (
								// Two events may share a name, and they never reorder.
								<p key={index} className={styles.event}>
									{name}
								</p>
							))}
						</div>
						{miniMonth && (
							<div className={styles.miniMonth}>
								<MiniMonth {...miniMonth} />
							</div>
						)}
					</div>
					<DayLines fill={firstFill} />
					{footer}
				</div>
			</Page>
			{nextFills.map((fill, index) => (
				// The sheets after the first never reorder, so the index is the key.
				<Page key={index} setup={setup}>
					<div className={styles.layout}>
						<DayLines fill={fill} />
						{footer}
					</div>
				</Page>
			))}
		</>
	)
})
