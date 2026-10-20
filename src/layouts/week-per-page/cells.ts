import type { Week, WeekDay } from '../../core/calendar'
import type { Orientation } from '../../core/paper'

// How a week page divides its week: into cells, over one sheet or two, as rows or columns.

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

/**
 * How a `week-per-page` page lays out its days: `vertical` as columns side by side, left to right;
 * `horizontal` as rows stacked top to bottom; `auto` columns on landscape paper or over two pages,
 * rows otherwise.
 */
export const WEEK_DAY_DIRECTIONS = ['auto', 'vertical', 'horizontal'] as const
export type WeekDayDirection = (typeof WEEK_DAY_DIRECTIONS)[number]

/** Whether a week page stacks its days as rows (true) or sets them side by side as columns. */
export function stacksDays(
	direction: WeekDayDirection,
	orientation: Orientation,
	twoPages: boolean,
): boolean {
	if (direction === 'auto') return orientation === 'portrait' && !twoPages
	return direction === 'horizontal'
}
