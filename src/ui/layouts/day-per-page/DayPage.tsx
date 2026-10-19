import { memo } from 'react'
import type { PageSetup } from '../../../config/CalendarConfig'
import type { DayPageLines, DayPageTitle } from '../../../config/layouts/dayPerPage'
import { type CalendarDay, type CalendarMonth, dayOfYear, isoWeek } from '../../../core/calendar'
import { fullDateName, type Locale, weekdayName } from '../../../core/locale'
import { PRINT_MESSAGES } from '../../../core/messages'
import { contentBox } from '../../../core/paper'
import { isHighlightedDay, type WeekendHighlight } from '../../../core/weekend'
import { CalendarHeader } from '../CalendarHeader'
import styles from './DayPage.module.css'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'

/** Distance between ruled lines, in mm. */
const RULED_LINE_SPACING = 8

/**
 * Enough ruled lines to fill the page inside its margins; the header takes some of that height,
 * and the ruled area clips the lines that don't fit.
 */
function ruledLineCount(setup: PageSetup): number {
	return Math.ceil(contentBox(setup).height / RULED_LINE_SPACING)
}

interface DayPageProps {
	day: CalendarDay
	/** 365 or 366, for the "Day 42 / 365" line. */
	daysInYear: number
	/** The month `day` belongs to, drawn small with the day marked; none hides it. */
	month?: CalendarMonth
	monthName: string
	/** Weekday labels, already ordered by week start. */
	weekdays: string[]
	/** Labels of the schedule's hours, one row each. */
	hours: string[]
	/** Whether the heading is the weekday or the date; the other is the subheading. */
	title: DayPageTitle
	/** What fills the page under the header. */
	lines: DayPageLines
	/** Language of the date names and of the week and day-of-year line. */
	locale: Locale
	highlightWeekends: WeekendHighlight
	/** Week numbers column of the small month. */
	showWeekNumbers: boolean
	/** Parts of the details line under the heading: "Week N" and "Day N / 365". */
	showWeek: boolean
	showDayOfYear: boolean
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
	hours,
	title,
	lines,
	locale,
	highlightWeekends,
	showWeekNumbers,
	showWeek,
	showDayOfYear,
	setup,
}: DayPageProps) {
	const messages = PRINT_MESSAGES[locale]
	const weekday = weekdayName(locale, day)
	const date = fullDateName(locale, day)
	const details = [
		showWeek ? messages.week(isoWeek(day)) : '',
		showDayOfYear ? messages.dayOfYear(dayOfYear(day), daysInYear) : '',
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<Page setup={setup}>
			<div className={styles.layout}>
				<div className={styles.top}>
					<div className={styles.heading}>
						<CalendarHeader
							heading={title === 'weekday' ? weekday : date}
							subheading={title === 'weekday' ? date : weekday}
							size="compact"
							align="start"
							highlight={isHighlightedDay(day, highlightWeekends)}
						/>
						{details && <p className={styles.details}>{details}</p>}
					</div>
					{month && (
						<div className={styles.miniMonth}>
							<MiniMonth
								month={month}
								name={monthName}
								weekdays={weekdays}
								highlightWeekends={highlightWeekends}
								showWeekNumbers={showWeekNumbers}
								markedDay={day.day}
								size="small"
							/>
						</div>
					)}
				</div>
				{lines === 'ruled' ? (
					<div
						className={styles.ruled}
						style={{ gridAutoRows: `${RULED_LINE_SPACING}mm` }}
					>
						{Array.from({ length: ruledLineCount(setup) }, (_, index) => (
							// The lines are identical and never reorder, so the index is the key.
							<div key={index} className={styles.ruledLine} />
						))}
					</div>
				) : (
					<div
						className={styles.schedule}
						style={{ gridTemplateRows: `repeat(${hours.length}, 1fr)` }}
					>
						{hours.map((hour) => (
							<div key={hour} className={styles.hour}>
								<span className={styles.hourLabel}>{hour}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</Page>
	)
})
