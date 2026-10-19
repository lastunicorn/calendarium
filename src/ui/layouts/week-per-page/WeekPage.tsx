import { memo } from 'react'
import type { PageSetup } from '../../../config/CalendarConfig'
import { type WeekDay, type WeekStart, weekNumber } from '../../../core/calendar'
import { dateRangeName, type Locale } from '../../../core/locale'
import { PRINT_MESSAGES } from '../../../core/messages'
import { isHighlightedWeekDay, type WeekendHighlight } from '../../../core/weekend'
import { CalendarHeader } from '../CalendarHeader'
import { Page } from '../Page'
import styles from './WeekPage.module.css'

interface WeekPageProps {
	/**
	 * The page's cells from the week start (`weekCells`), each holding one day, or two sharing it;
	 * the first and last week reach into other years.
	 */
	cells: WeekDay[][]
	/** Weekday labels, ordered from `weekStart`. */
	weekdays: string[]
	weekStart: WeekStart
	monthNames: string[]
	/**
	 * Labels of the hourly schedule drawn in the cell of each day of the year, one row each; days
	 * sharing a cell get none. None leaves every cell blank.
	 */
	hours?: string[]
	/** Language of the date range and of the week line. */
	locale: Locale
	highlightWeekends: WeekendHighlight
	showWeekNumbers: boolean
	setup: PageSetup
}

interface WeekDayCellProps {
	day: WeekDay
	weekday: string
	/** Shown next to the weekday when given. */
	monthName?: string
	highlighted: boolean
	/** Labels of the cell's hourly schedule; none leaves the cell blank. */
	hours?: string[]
	/** Whether the schedule runs down the cell (side-by-side cells) or across it (stacked ones). */
	stacked: boolean
}

/** A day's cell: its label in the top-left corner, the rest space to write in, maybe by the hour. */
function WeekDayCell({ day, weekday, monthName, highlighted, hours, stacked }: WeekDayCellProps) {
	return (
		<div
			className={[
				styles.day,
				highlighted ? styles.weekend : '',
				day.inYear ? '' : styles.otherYear,
			].join(' ')}
		>
			<div className={styles.label}>
				<span className={styles.number}>{day.day}</span>
				<span className={styles.weekday}>{weekday}</span>
				{monthName && <span className={styles.month}>{monthName}</span>}
			</div>
			{hours && (
				<div
					className={`${styles.schedule} ${stacked ? styles.across : styles.down}`}
					style={
						stacked
							? { gridTemplateColumns: `repeat(${hours.length}, 1fr)` }
							: { gridTemplateRows: `repeat(${hours.length}, 1fr)` }
					}
				>
					{hours.map((hour) => (
						<div key={hour} className={styles.hour}>
							<span className={styles.hourLabel}>{hour}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

/**
 * One week's sheet: a cell to write in for each day, side by side on landscape paper and stacked
 * on portrait; Saturday and Sunday may share a cell, split in half. Each unshared cell may hold an
 * hourly schedule, running down side-by-side cells and across stacked ones. Memoized because a year has
 * 53 of them and most config changes leave each page's props unchanged.
 */
export const WeekPage = memo(function WeekPage({
	cells,
	weekdays,
	weekStart,
	monthNames,
	hours,
	locale,
	highlightWeekends,
	showWeekNumbers,
	setup,
}: WeekPageProps) {
	const stacked = setup.orientation === 'portrait'
	const days = cells.flat()

	/**
	 * `shared` for a day sharing its cell, which has no room for the schedule; days of another year
	 * get none either.
	 */
	function cellProps(day: WeekDay, shared: boolean): WeekDayCellProps {
		return {
			day,
			weekday: weekdays[(day.weekday - weekStart + 7) % 7],
			// The month is named where it changes, and on the page's first day for context.
			monthName: day === days[0] || day.day === 1 ? monthNames[day.month] : undefined,
			highlighted: isHighlightedWeekDay(day, highlightWeekends),
			hours: shared || !day.inYear ? undefined : hours,
			stacked,
		}
	}

	return (
		<Page setup={setup}>
			<div className={styles.layout}>
				<CalendarHeader
					heading={dateRangeName(locale, days[0], days.at(-1)!)}
					subheading={
						showWeekNumbers ? PRINT_MESSAGES[locale].week(weekNumber(days)) : ''
					}
					size="compact"
				/>
				<div className={`${styles.week} ${stacked ? styles.rows : styles.columns}`}>
					{cells.map((cell) =>
						cell.length === 1 ? (
							<WeekDayCell key={cell[0].key} {...cellProps(cell[0], false)} />
						) : (
							<div key={cell[0].key} className={styles.pair}>
								{cell.map((day) => (
									<WeekDayCell key={day.key} {...cellProps(day, true)} />
								))}
							</div>
						),
					)}
				</div>
			</div>
		</Page>
	)
})
