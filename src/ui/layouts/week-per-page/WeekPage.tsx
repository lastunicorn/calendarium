import { memo } from 'react'
import type { PageSetup } from '../../../config/CalendarConfig'
import { type WeekDay, weekNumber } from '../../../core/calendar'
import { dateRangeName, type Locale } from '../../../core/locale'
import { PRINT_MESSAGES } from '../../../core/messages'
import { isHighlightedWeekDay, type WeekendHighlight } from '../../../core/weekend'
import { CalendarHeader } from '../CalendarHeader'
import { Page } from '../Page'
import styles from './WeekPage.module.css'

interface WeekPageProps {
	/** The 7 days of the page, from the week start; the first and last week reach into other years. */
	week: WeekDay[]
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	monthNames: string[]
	/** Language of the date range and of the week line. */
	locale: Locale
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	setup: PageSetup
}

/**
 * One week's sheet: a cell to write in for each day, side by side on landscape paper and stacked
 * on portrait. Memoized because a year has 53 of them and most config changes leave each page's
 * props unchanged.
 */
export const WeekPage = memo(function WeekPage({
	week,
	weekdays,
	monthNames,
	locale,
	highlightWeekends,
	showWeekNumbers,
	setup,
}: WeekPageProps) {
	const stacked = setup.orientation === 'portrait'

	return (
		<Page setup={setup}>
			<div className={styles.layout}>
				<CalendarHeader
					heading={dateRangeName(locale, week[0], week[6])}
					subheading={
						showWeekNumbers ? PRINT_MESSAGES[locale].week(weekNumber(week)) : ''
					}
					size="compact"
				/>
				<div className={`${styles.week} ${stacked ? styles.rows : styles.columns}`}>
					{week.map((day, index) => (
						<div
							key={day.key}
							className={[
								styles.day,
								isHighlightedWeekDay(day, highlightWeekends) ? styles.weekend : '',
								day.inYear ? '' : styles.otherYear,
							].join(' ')}
						>
							<div className={styles.label}>
								<span className={styles.number}>{day.day}</span>
								<span className={styles.weekday}>{weekdays[index]}</span>
								{/* The month is named where it changes, and on the first day for context. */}
								{(index === 0 || day.day === 1) && (
									<span className={styles.month}>{monthNames[day.month]}</span>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</Page>
	)
})
