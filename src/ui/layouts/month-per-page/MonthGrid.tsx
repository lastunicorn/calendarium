import { Fragment } from 'react'
import { weekNumber } from '../../../core/calendar'
import { isHighlightedColumn, isHighlightedDay } from '../../../core/weekend'
import type { MonthGridPlan } from '../../../layouts/month-per-page/pages'
import styles from './MonthGrid.module.css'

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
}: MonthGridPlan) {
	const weekendColumns = weeks[0].map((day) => isHighlightedColumn(day, highlightWeekends))

	return (
		<div
			className={`${styles.grid} ${showWeekNumbers ? styles.withWeekNumbers : ''}`}
			// Weeks share the height left under the weekday row; a month has 4–6 of them.
			style={{ gridTemplateRows: `auto repeat(${weeks.length}, 1fr)` }}
		>
			{showWeekNumbers && <div className={`${styles.weekday} ${styles.weekNumber}`} />}
			{weekdays.map((weekday, index) => (
				<div
					// Narrow names repeat (T, T, S, S), so the column index is the key.
					key={index}
					className={`${styles.weekday} ${weekendColumns[index] ? styles.weekend : ''}`}
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
								isHighlightedDay(day, highlightWeekends) ? styles.weekend : '',
								day.inMonth ? '' : styles.adjacent,
							].join(' ')}
						>
							{(day.inMonth || showAdjacentMonthDays) && day.day}
							{day.events.map((name, index) => (
								// Two events may share a name, and they never reorder.
								<span key={index} className={styles.event}>
									{name}
								</span>
							))}
						</div>
					))}
				</Fragment>
			))}
		</div>
	)
}
