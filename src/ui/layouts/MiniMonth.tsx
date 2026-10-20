import { Fragment } from 'react'
import { weekNumber } from '../../core/calendar'
import { isHighlightedColumn, isHighlightedDay } from '../../core/weekend'
import type { MiniMonthPlan } from '../../layouts/monthGrid'
import styles from './MiniMonth.module.css'

/** A small month as a page plans it (`MiniMonthPlan`), drawn at a size. */
interface MiniMonthProps extends MiniMonthPlan {
	/** `small` shrinks the text, for a mini month in the corner of a page. */
	size?: 'normal' | 'small'
}

export function MiniMonth({
	month,
	name,
	weekdays,
	highlightWeekends,
	showWeekNumbers,
	markedDay,
	markedWeek,
	eventDays = [],
	size = 'normal',
}: MiniMonthProps) {
	const weekendColumns = month.weeks[0].map((day) => isHighlightedColumn(day, highlightWeekends))

	return (
		<div className={`${styles.month} ${size === 'small' ? styles.small : ''}`}>
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
				{month.weeks.map((week) => {
					const marked = week.some((day) => day.key === markedWeek)
					return (
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
										isHighlightedDay(day, highlightWeekends)
											? styles.weekend
											: '',
										day.inMonth && day.day === markedDay ? styles.marked : '',
										marked ? styles.markedWeek : '',
									].join(' ')}
								>
									{day.inMonth &&
										(eventDays.includes(day.day) ? (
											<span className={styles.event}>{day.day}</span>
										) : (
											day.day
										))}
								</div>
							))}
						</Fragment>
					)
				})}
			</div>
		</div>
	)
}
