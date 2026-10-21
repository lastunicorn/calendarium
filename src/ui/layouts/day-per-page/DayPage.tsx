import { type CSSProperties, memo, useId } from 'react'
import type { PageSetup } from '../../../core/paper'
import type { SquareGridAlignment } from '../../../layouts/day-per-page/options'
import type { DayFill, DayPages } from '../../../layouts/day-per-page/pages'
import { CalendarHeader } from '../CalendarHeader'
import styles from './DayPage.module.css'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'

/** The inline style of the squares, with their side as a custom property the stylesheet sizes the grid by. */
type SquaresStyle = CSSProperties & Record<'--square-size', string>

/** The class setting the grid of squares across the page, per alignment. */
const SQUARE_GRID_ALIGN_CLASSES: Record<SquareGridAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

/** The diameter of a dot in the `dots` fill, in mm. */
const DOT_SIZE = 0.5

/** The inline style of the dots, with their spacing and size as custom properties the stylesheet sizes the grid by. */
type DotsStyle = CSSProperties & Record<'--square-size' | '--dot-size', string>

interface DotGridProps {
	/** The distance between dots, in mm. */
	size: number
}

/**
 * Dots at the corners of squares `size` mm a side, painted by one SVG pattern rather than one
 * element per dot: a tile `size` a side with a dot at its center, shifted so the first dot's edge
 * meets the grid's. The grid, sized in CSS, is cut to the whole squares that fit.
 */
function DotGrid({ size }: DotGridProps) {
	const patternId = useId()
	const radius = DOT_SIZE / 2
	return (
		<svg className={styles.dotGrid} aria-hidden="true">
			<defs>
				<pattern
					id={patternId}
					patternUnits="userSpaceOnUse"
					x={`${radius - size / 2}mm`}
					y={`${radius - size / 2}mm`}
					width={`${size}mm`}
					height={`${size}mm`}
				>
					<circle
						className={styles.dot}
						cx={`${size / 2}mm`}
						cy={`${size / 2}mm`}
						r={`${radius}mm`}
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
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
			<div
				className={`${styles.squares} ${SQUARE_GRID_ALIGN_CLASSES[fill.align]}`}
				style={style}
			>
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
			<div
				className={`${styles.squares} ${SQUARE_GRID_ALIGN_CLASSES[fill.align]}`}
				style={style}
			>
				<DotGrid size={fill.size} />
			</div>
		)
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
	return (
		<>
			<Page setup={setup}>
				<div className={styles.layout}>
					<div className={styles.top}>
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
								<MiniMonth {...miniMonth} size="small" />
							</div>
						)}
					</div>
					<DayLines fill={firstFill} />
				</div>
			</Page>
			{nextFills.map((fill, index) => (
				// The sheets after the first never reorder, so the index is the key.
				<Page key={index} setup={setup}>
					<div className={styles.layout}>
						<DayLines fill={fill} />
					</div>
				</Page>
			))}
		</>
	)
})
