import type { CalendarDay, Week, WeekDay } from './calendar'

/** `days` highlights only weekend cells with a day number; `columns` the whole weekend column. */
export const WEEKEND_HIGHLIGHTS = ['off', 'days', 'columns'] as const
export type WeekendHighlight = (typeof WEEKEND_HIGHLIGHTS)[number]

/**
 * Whether a month grid's day cell gets the weekend highlight: `columns` every weekend cell, `days`
 * only those of the month.
 */
export function isHighlightedDay(day: CalendarDay, mode: WeekendHighlight): boolean {
	if (!day.isWeekend) return false
	return mode === 'columns' || (mode === 'days' && day.inMonth)
}

/** Whether a week page's day gets the weekend highlight: never a grayed day of another year. */
export function isHighlightedWeekDay(day: WeekDay, highlight: boolean): boolean {
	return highlight && day.isWeekend && day.inYear
}

/** Whether the weekday heading above `day`'s column gets the weekend highlight. */
export function isHighlightedColumn(day: CalendarDay, mode: WeekendHighlight): boolean {
	return mode !== 'off' && day.isWeekend
}

/**
 * How a week page draws Saturday and Sunday: `full` a cell each like the other days, `reduced`
 * one cell split between them, `hidden` not at all.
 */
export const WEEKEND_DISPLAYS = ['full', 'reduced', 'hidden'] as const
export type WeekendDisplay = (typeof WEEKEND_DISPLAYS)[number]

/** The days drawn in one cell of a week page: one day, or Saturday and Sunday sharing it. */
export type WeekCell = WeekDay[]

/**
 * The cells of a week page, in order, each holding the days drawn in it: one day, or Saturday then
 * Sunday when `reduced`. Reducing needs Sunday right after Saturday, so a week starting on
 * Sunday falls back to `full`.
 */
export function weekCells(week: Week, display: WeekendDisplay): WeekCell[] {
	if (display === 'hidden') return week.filter((day) => !day.isWeekend).map((day) => [day])
	const saturday = week.findIndex((day) => day.weekday === 6)
	const reduce = display === 'reduced' && week[saturday + 1]?.weekday === 0
	const cells: WeekCell[] = []
	week.forEach((day, index) => {
		if (reduce && index === saturday + 1) cells.at(-1)!.push(day)
		else cells.push([day])
	})
	return cells
}

/** How many days of a week the first of its two pages holds. */
const FIRST_PAGE_DAYS = 3

/**
 * A week's cells split over two pages: the cells holding its first three days, then the rest. A
 * shared weekend cell is never split, so the first page may hold one more day.
 */
export function splitWeekCells(cells: WeekCell[]): [WeekCell[], WeekCell[]] {
	let days = 0
	let split = 0
	while (split < cells.length && days < FIRST_PAGE_DAYS) days += cells[split++].length
	return [cells.slice(0, split), cells.slice(split)]
}
