import { memo } from 'react'
import type { PageSetup } from '../../config/CalendarConfig'
import { type CalendarDay, type CalendarMonth, dayOfYear, isoWeek } from '../../core/calendar'
import { fullDateName, weekdayName } from '../../core/locale'
import { isHighlightedDay, type WeekendHighlight } from '../../core/weekend'
import { CalendarHeader } from './CalendarHeader'
import styles from './DayPage.module.css'
import { MiniMonth } from './MiniMonth'
import { Page } from './Page'

interface DayPageProps {
	day: CalendarDay
	/** 365 or 366, for the "Day 42 / 365" line. */
	daysInYear: number
	/** The month `day` belongs to, drawn small with the day marked. */
	month: CalendarMonth
	monthName: string
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	locale: string
	/** Title and subtitle, shown in small type; hidden when empty. */
	subheading: string
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	setup: PageSetup
}

/**
 * One day's sheet. Memoized because a year has 366 of them and most config changes leave
 * each page's props unchanged.
 */
export const DayPage = memo(function DayPage({
	day,
	daysInYear,
	month,
	monthName,
	weekdays,
	locale,
	subheading,
	highlightWeekends,
	showWeekNumbers,
	setup,
}: DayPageProps) {
	const details = [
		subheading,
		showWeekNumbers ? `Week ${isoWeek(day.date)}` : '',
		`Day ${dayOfYear(day.date)} / ${daysInYear}`,
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<Page setup={setup}>
			<div className={styles.layout}>
				<div className={styles.top}>
					<div className={styles.heading}>
						<CalendarHeader
							heading={weekdayName(locale, day.date)}
							subheading={fullDateName(locale, day.date)}
							size="compact"
							align="start"
							highlight={isHighlightedDay(day, highlightWeekends)}
						/>
						<p className={styles.details}>{details}</p>
					</div>
					<div className={styles.miniMonth}>
						<MiniMonth
							month={month}
							name={monthName}
							weekdays={weekdays}
							highlightWeekends={highlightWeekends}
							showWeekNumbers={showWeekNumbers}
							markedDay={day.day}
						/>
					</div>
				</div>
				<div className={styles.lines} />
			</div>
		</Page>
	)
})
