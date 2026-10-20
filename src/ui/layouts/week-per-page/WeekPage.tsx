import { memo } from 'react'
import type { PageSetup } from '../../../core/paper'
import {
	splitWeekCells,
	stacksDays,
	type WeekCell,
	type WeekDayDirection,
} from '../../../layouts/week-per-page/cells'
import {
	type CalendarMonth,
	type WeekDay,
	weekdayColumn,
	type WeekStart,
	weekNumber,
} from '../../../core/calendar'
import { dateRangeName, type Locale } from '../../../core/locale'
import { PRINT_MESSAGES } from '../../../core/messages'
import { isHighlightedWeekDay, type WeekendHighlight } from '../../../core/weekend'
import { CalendarHeader } from '../CalendarHeader'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'
import styles from './WeekPage.module.css'

interface WeekPageProps {
	/**
	 * The page's cells from the week start (`weekCells`), each holding one day, or two sharing it;
	 * the first and last week reach into other years.
	 */
	cells: WeekCell[]
	/** Weekday labels, ordered from `weekStart`. */
	weekdays: string[]
	weekStart: WeekStart
	monthNames: string[]
	/**
	 * Labels of the hourly schedule drawn in the cell of each day of the year, one row each; days
	 * sharing a cell get none. None leaves every cell blank.
	 */
	hours?: string[]
	/**
	 * Whether the week spreads over two pages (`splitWeekCells`): the heading, set to the left,
	 * on the first only, and the mini month on the second only, each leaving the other's space.
	 */
	twoPages: boolean
	/** Whether the days are columns or rows, with the orientation and `twoPages` (`stacksDays`). */
	direction: WeekDayDirection
	/** Language of the date range and of the week line. */
	locale: Locale
	/** Whether the weekend days of the year get the weekend color. */
	highlightWeekendDays: boolean
	/** Whether the heading shows "Week N". */
	showHeaderWeek: boolean
	/** The week's month, drawn small beside the heading with the week marked; none leaves it out. */
	miniMonth?: CalendarMonth
	/** The small month's weekday labels, its weekend highlight and its week numbers column. */
	miniWeekdays: string[]
	miniMonthHighlight: WeekendHighlight
	miniMonthWeekNumbers: boolean
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

interface WeekGridProps {
	/** The cells drawn on this page, in order. */
	cells: WeekCell[]
	weekdays: string[]
	weekStart: WeekStart
	monthNames: string[]
	hours?: string[]
	highlightWeekendDays: boolean
	stacked: boolean
}

/** One page's cells: side by side, or stacked; a shared weekend cell split in half. */
function WeekGrid({
	cells,
	weekdays,
	weekStart,
	monthNames,
	hours,
	highlightWeekendDays,
	stacked,
}: WeekGridProps) {
	const firstDay = cells[0][0]

	/**
	 * `shared` for a day sharing its cell, which has no room for the schedule; days of another year
	 * get none either.
	 */
	function cellProps(day: WeekDay, shared: boolean): WeekDayCellProps {
		return {
			day,
			weekday: weekdays[weekdayColumn(day.weekday, weekStart)],
			// The month is named where it changes, and on the page's first day for context.
			monthName: day === firstDay || day.day === 1 ? monthNames[day.month] : undefined,
			highlighted: isHighlightedWeekDay(day, highlightWeekendDays),
			hours: shared || !day.inYear ? undefined : hours,
			stacked,
		}
	}

	return (
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
	)
}

/**
 * One week's sheet: a cell to write in for each day, side by side or stacked per `direction`;
 * Saturday and Sunday may share a cell, split in half. Each unshared cell may hold an hourly
 * schedule, running down side-by-side cells and across stacked ones. With `twoPages`, the week
 * spreads over two sheets. Memoized because a year has 53 of them and most config changes
 * leave each page's props unchanged.
 */
export const WeekPage = memo(function WeekPage({
	cells,
	weekdays,
	weekStart,
	monthNames,
	hours,
	twoPages,
	direction,
	locale,
	highlightWeekendDays,
	showHeaderWeek,
	miniMonth,
	miniWeekdays,
	miniMonthHighlight,
	miniMonthWeekNumbers,
	setup,
}: WeekPageProps) {
	const stacked = stacksDays(direction, setup.orientation, twoPages)
	const days = cells.flat()
	const gridProps = { weekdays, weekStart, monthNames, hours, highlightWeekendDays, stacked }
	const heading = (
		<CalendarHeader
			heading={dateRangeName(locale, days[0], days.at(-1)!)}
			subheading={showHeaderWeek ? PRINT_MESSAGES[locale].week(weekNumber(days)) : ''}
			size="compact"
			align={twoPages || miniMonth ? 'start' : 'center'}
		/>
	)
	/**
	 * The header row showing `part`: a single page shows both, a week's first page the heading and
	 * its second the mini month. The part left out keeps its space, hidden, so both pages' cells
	 * start at the same height. With the mini month, the heading is set to its left, as on a day page;
	 * on two pages, where they never show together, the heading may run under the mini month's box.
	 */
	function header(part: 'both' | 'heading' | 'miniMonth') {
		const hideHeading = part === 'miniMonth'
		const hideMiniMonth = part === 'heading'
		if (!miniMonth) {
			return (
				<div
					className={hideHeading ? styles.hidden : undefined}
					aria-hidden={hideHeading || undefined}
				>
					{heading}
				</div>
			)
		}
		return (
			<div className={styles.top}>
				<div
					className={[
						styles.heading,
						part === 'both' ? '' : styles.wide,
						hideHeading ? styles.hidden : '',
					].join(' ')}
					aria-hidden={hideHeading || undefined}
				>
					{heading}
				</div>
				<div
					className={`${styles.miniMonth} ${hideMiniMonth ? styles.hidden : ''}`}
					aria-hidden={hideMiniMonth || undefined}
				>
					<MiniMonth
						month={miniMonth}
						name={monthNames[miniMonth.month]}
						weekdays={miniWeekdays}
						highlightWeekends={miniMonthHighlight}
						showWeekNumbers={miniMonthWeekNumbers}
						markedWeek={days[0].key}
						size="small"
					/>
				</div>
			</div>
		)
	}

	if (!twoPages) {
		return (
			<Page setup={setup}>
				<div className={styles.layout}>
					{header('both')}
					<WeekGrid cells={cells} {...gridProps} />
				</div>
			</Page>
		)
	}
	const [firstCells, secondCells] = splitWeekCells(cells)
	return (
		<>
			<Page setup={setup}>
				<div className={styles.layout}>
					{header('heading')}
					<WeekGrid cells={firstCells} {...gridProps} />
				</div>
			</Page>
			<Page setup={setup}>
				<div className={styles.layout}>
					{header('miniMonth')}
					<WeekGrid cells={secondCells} {...gridProps} />
				</div>
			</Page>
		</>
	)
})
