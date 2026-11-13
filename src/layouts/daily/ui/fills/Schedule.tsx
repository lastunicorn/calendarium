import type { DayFill } from '../../pages'
import styles from './Schedule.module.css'

interface ScheduleProps {
	/** The hours as `planDayPages` plans them. */
	fill: Extract<DayFill, { kind: 'hours' }>
}

/** The hourly schedule filling the area left under a day's header, one labeled row per hour. */
export function Schedule({ fill }: ScheduleProps) {
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
