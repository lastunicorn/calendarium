import type { EventListPage } from '../../../layouts/year-per-page/pages'
import { CalendarHeader } from '../CalendarHeader'
import styles from './EventList.module.css'

/** The year's events, one per line with its date, in columns filling the page. */
export function EventList({ heading, subheading, events }: EventListPage) {
	return (
		<div className={styles.layout}>
			<CalendarHeader heading={heading} subheading={subheading} />
			<ol className={styles.list}>
				{events.map((event) => (
					<li key={event.key} className={styles.event}>
						<span className={styles.date}>{event.date}</span>
						<span className={styles.name}>{event.name}</span>
					</li>
				))}
			</ol>
		</div>
	)
}
