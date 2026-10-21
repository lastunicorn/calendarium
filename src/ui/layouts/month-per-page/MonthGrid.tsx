import { Fragment } from 'react'
import { weekNumber } from '../../../core/calendar'
import { isFilledColumnHeading, isHighlightedColumn, isHighlightedDay } from '../../../core/weekend'
import type {
	DayNumberHorizontalAlignment,
	DayNumberVerticalAlignment,
} from '../../../layouts/month-per-page/options'
import type { MonthGridPlan } from '../../../layouts/month-per-page/pages'
import styles from './MonthGrid.module.css'

const HORIZONTAL_ALIGN_CLASSES: Record<DayNumberHorizontalAlignment, string> = {
	left: styles.alignLeft,
	center: styles.alignCenter,
	right: styles.alignRight,
}

const VERTICAL_ALIGN_CLASSES: Record<DayNumberVerticalAlignment, string> = {
	top: styles.alignTop,
	center: styles.alignMiddle,
	bottom: styles.alignBottom,
}

/**
 * A full-page month (`MonthGridPlan`): large cells with room to write, adjacent-month days in gray
 * or left blank.
 */
export function MonthGrid({
	weeks,
	weekdays,
	highlightWeekends,
	showWeekNumbers,
	showAdjacentMonthDays,
	showGridLines,
	dayNumberFontSize,
	dayNumberHorizontalAlignment,
	dayNumberVerticalAlignment,
}: MonthGridPlan) {
	const dayAlignClasses = `${HORIZONTAL_ALIGN_CLASSES[dayNumberHorizontalAlignment]} ${VERTICAL_ALIGN_CLASSES[dayNumberVerticalAlignment]}`
	const numberStyle = { fontSize: `${dayNumberFontSize}pt` }
	const weekendColumns = weeks[0].map((day) => isHighlightedColumn(day, highlightWeekends))
	const filledHeadings = weeks[0].map((day) => isFilledColumnHeading(day, highlightWeekends))

	return (
		<div
			className={[
				styles.grid,
				showWeekNumbers ? styles.withWeekNumbers : '',
				showGridLines ? '' : styles.withoutLines,
			].join(' ')}
			// Weeks share the height left under the weekday row; a month has 4–6 of them.
			style={{ gridTemplateRows: `auto repeat(${weeks.length}, 1fr)` }}
		>
			{showWeekNumbers && <div className={`${styles.weekday} ${styles.weekNumber}`} />}
			{weekdays.map((weekday, index) => (
				<div
					// Narrow names repeat (T, T, S, S), so the column index is the key.
					key={index}
					className={[
						styles.weekday,
						weekendColumns[index] ? styles.weekend : '',
						filledHeadings[index] ? styles.filled : '',
					].join(' ')}
				>
					{weekday}
				</div>
			))}
			{weeks.map((week) => (
				<Fragment key={week[0].key}>
					{showWeekNumbers && <div className={styles.weekNumber}>{weekNumber(week)}</div>}
					{week.map((day) => (
						<div
							key={day.key}
							className={[
								styles.day,
								dayAlignClasses,
								isHighlightedDay(day, highlightWeekends) ? styles.weekend : '',
								day.inMonth ? '' : styles.adjacent,
							].join(' ')}
						>
							{(day.inMonth || showAdjacentMonthDays) && (
								<span className={styles.number} style={numberStyle}>
									{day.day}
								</span>
							)}
							{day.events.length > 0 && (
								<div className={styles.events}>
									{day.events.map((name, index) => (
										// Two events may share a name, and they never reorder.
										<span key={index} className={styles.event}>
											{name}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</Fragment>
			))}
		</div>
	)
}
