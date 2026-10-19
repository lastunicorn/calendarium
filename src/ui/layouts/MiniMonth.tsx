import { Fragment } from 'react'
import { type CalendarMonth, weekNumber } from '../../core/calendar'
import { isHighlightedColumn, isHighlightedDay, type WeekendHighlight } from '../../core/weekend'
import styles from './MiniMonth.module.css'

interface MiniMonthProps {
	month: CalendarMonth
	name: string
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	/** Day of the month to mark, e.g. the day a page is about. */
	markedDay?: number
}

export function MiniMonth({
	month,
	name,
	weekdays,
	highlightWeekends,
	showWeekNumbers,
	markedDay,
}: MiniMonthProps) {
	const weekendColumns = month.weeks[0].map((day) => isHighlightedColumn(day, highlightWeekends))

	return (
		<div className={styles.month}>
			<h2 className={styles.name}>{name}</h2>
			<div className={`${styles.days} ${showWeekNumbers ? styles.withWeekNumbers : ''}`}>
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
				{month.weeks.map((week) => (
					<Fragment key={week[0].key}>
						{showWeekNumbers && (
							<div className={styles.weekNumber}>
								{/* Trailing rows made only of next-month days stay blank. */}
								{week.some((day) => day.inMonth) ? weekNumber(week) : ''}
							</div>
						)}
						{week.map((day) => (
							<div
								key={day.key}
								className={[
									styles.day,
									isHighlightedDay(day, highlightWeekends) ? styles.weekend : '',
									day.inMonth && day.day === markedDay ? styles.marked : '',
								].join(' ')}
							>
								{day.inMonth ? day.day : ''}
							</div>
						))}
					</Fragment>
				))}
			</div>
		</div>
	)
}
