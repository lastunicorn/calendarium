import { Fragment } from 'react'
import { type CalendarMonth, visibleWeeks, weekNumber } from '../../core/calendar'
import { isHighlightedColumn, isHighlightedDay, type WeekendHighlight } from '../../core/weekend'
import styles from './MonthGrid.module.css'

interface MonthGridProps {
	month: CalendarMonth
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
}

/** A full-page month: large cells with room to write, adjacent-month days in gray. */
export function MonthGrid({ month, weekdays, highlightWeekends, showWeekNumbers }: MonthGridProps) {
	const weeks = visibleWeeks(month)
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
				<Fragment key={week[0].date.toISOString()}>
					{showWeekNumbers && <div className={styles.weekNumber}>{weekNumber(week)}</div>}
					{week.map((day) => (
						<div
							key={day.date.toISOString()}
							className={[
								styles.day,
								isHighlightedDay(day, highlightWeekends) ? styles.weekend : '',
								day.inMonth ? '' : styles.adjacent,
							].join(' ')}
						>
							{day.day}
						</div>
					))}
				</Fragment>
			))}
		</div>
	)
}
