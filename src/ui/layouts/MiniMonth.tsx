import { Fragment } from 'react'
import { weekNumber } from '../../core/calendar'
import { isHighlightedColumn, isHighlightedDay } from '../../core/weekend'
import type { MiniMonthPlan } from '../../layouts/monthGrid'
import styles from './MiniMonth.module.css'
import { miniMonthSizeClass } from './miniMonthSize'

/**
 * A small month as a page plans it (`MiniMonthPlan`): with a `size`, it fills a corner of the page,
 * whose box its layout sizes by `miniMonthSizeClass`; without one, a full-size grid.
 */
export function MiniMonth({
	month,
	name,
	weekdays,
	highlightWeekends,
	showWeekNumbers,
	markedDay,
	markedWeek,
	eventDays = [],
	size,
}: MiniMonthPlan) {
	const weekendColumns = month.weeks[0].map((day) => isHighlightedColumn(day, highlightWeekends))

	return (
		<div
			className={`${styles.month} ${size === undefined ? '' : styles.sized} ${miniMonthSizeClass(size)}`}
		>
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
					// Trailing rows made only of next-month days stay blank, without the rule.
					const empty = !week.some((day) => day.inMonth)
					return (
						<Fragment key={week[0].key}>
							{showWeekNumbers && (
								<div
									className={`${styles.weekNumber} ${empty ? styles.emptyWeek : ''}`}
								>
									{empty ? '' : weekNumber(week)}
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
