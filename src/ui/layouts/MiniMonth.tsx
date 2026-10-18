import type { WeekendHighlight } from '../../config/CalendarConfig'
import type { CalendarDay, CalendarMonth } from '../../core/calendar'
import styles from './MiniMonth.module.css'

interface MiniMonthProps {
	month: CalendarMonth
	name: string
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	highlightWeekends: WeekendHighlight
}

export function MiniMonth({ month, name, weekdays, highlightWeekends }: MiniMonthProps) {
	const weekendColumns = month.weeks[0].map((day) => highlightWeekends !== 'off' && day.isWeekend)

	function isHighlighted(day: CalendarDay): boolean {
		if (!day.isWeekend) return false
		return highlightWeekends === 'columns' || (highlightWeekends === 'days' && day.inMonth)
	}

	return (
		<div className={styles.month}>
			<h2 className={styles.name}>{name}</h2>
			<div className={styles.days}>
				{weekdays.map((weekday, index) => (
					<div
						// Narrow names repeat (T, T, S, S), so the column index is the key.
						key={index}
						className={`${styles.weekday} ${weekendColumns[index] ? styles.weekend : ''}`}
					>
						{weekday}
					</div>
				))}
				{month.weeks.flat().map((day) => (
					<div
						key={day.date.toISOString()}
						className={`${styles.day} ${isHighlighted(day) ? styles.weekend : ''}`}
					>
						{day.inMonth ? day.day : ''}
					</div>
				))}
			</div>
		</div>
	)
}
