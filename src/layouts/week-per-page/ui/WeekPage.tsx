import { memo } from 'react'
import type { PageSetup } from '../../../core/paper'
import type { WeekHeaderPart, WeekPageDay, WeekPages, WeekSheet } from '../pages'
import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { miniMonthSizeClass } from '../../../ui/layouts/miniMonthSize'
import { Page } from '../../../ui/layouts/Page'
import styles from './WeekPage.module.css'

interface WeekPageProps {
	/** The week as `planWeekPages` plans it. */
	plan: WeekPages
	/** Labels of the hourly schedule, drawn in the cells planned to hold it. */
	hours?: string[]
	setup: PageSetup
}

interface WeekDayCellProps {
	plan: WeekPageDay
	hours?: string[]
	/** Whether the schedule runs down the cell (side-by-side cells) or across it (stacked ones). */
	stacked: boolean
}

/** A day's cell: its label in the top-left corner, the rest space to write in, maybe by the hour. */
function WeekDayCell({ plan, hours, stacked }: WeekDayCellProps) {
	const { day, weekday, monthName, highlighted, events, eventLines, schedule } = plan
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
			{eventLines > 0 && (
				<div className={styles.events}>
					{Array.from({ length: eventLines }, (_, index) => (
						// Two events may share a name, and they never reorder.
						<span key={index} className={styles.event}>
							{/* A blank line keeps its height. */}
							{events[index] ?? '\u00a0'}
						</span>
					))}
				</div>
			)}
			{schedule && hours && (
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
	/** The sheet as planned: its cells, in order. */
	sheet: WeekSheet
	hours?: string[]
	stacked: boolean
}

/** One sheet's cells: side by side, or stacked; a shared weekend cell split in half. */
function WeekGrid({ sheet, hours, stacked }: WeekGridProps) {
	const { cells } = sheet
	return (
		<div className={`${styles.week} ${stacked ? styles.rows : styles.columns}`}>
			{cells.map((cell) =>
				cell.length === 1 ? (
					<WeekDayCell
						key={cell[0].day.key}
						plan={cell[0]}
						hours={hours}
						stacked={stacked}
					/>
				) : (
					<div key={cell[0].day.key} className={styles.pair}>
						{cell.map((day) => (
							<WeekDayCell
								key={day.day.key}
								plan={day}
								hours={hours}
								stacked={stacked}
							/>
						))}
					</div>
				),
			)}
		</div>
	)
}

/**
 * One week's sheet, or two: a header row, then a cell to write in for each day. Memoized because a
 * year has 53 of them and an unchanged plan keeps its page objects.
 */
export const WeekPage = memo(function WeekPage({ plan, hours, setup }: WeekPageProps) {
	const { miniMonths, stacked } = plan
	const heading = (
		<CalendarHeader
			heading={plan.heading}
			subheading={plan.subheading}
			size="compact"
			align={plan.headingAlign}
			headingFontSize={plan.headingFontSize}
		/>
	)

	/**
	 * The header row showing `part`. With mini months, the heading is set to their left, as on a
	 * day page; on two sheets, where they never show together, the heading may run under the mini
	 * months' boxes.
	 */
	function header(part: WeekHeaderPart) {
		const hideHeading = part === 'miniMonth'
		const hideMiniMonth = part === 'heading'
		if (miniMonths.length === 0) {
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
			<div className={`${styles.top} ${miniMonthSizeClass(miniMonths[0].size)}`}>
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
					className={`${styles.miniMonths} ${hideMiniMonth ? styles.hidden : ''}`}
					aria-hidden={hideMiniMonth || undefined}
				>
					{miniMonths.map((miniMonth) => (
						<div key={miniMonth.month.weeks[0][0].key} className={styles.miniMonth}>
							<MiniMonth {...miniMonth} />
						</div>
					))}
				</div>
			</div>
		)
	}

	return plan.sheets.map((sheet) => (
		<Page key={sheet.header} setup={setup}>
			<div className={styles.layout}>
				{header(sheet.header)}
				<WeekGrid sheet={sheet} hours={hours} stacked={stacked} />
				{plan.footerHeight !== undefined && (
					<div className={styles.footer} style={{ height: `${plan.footerHeight}mm` }} />
				)}
			</div>
		</Page>
	))
})
