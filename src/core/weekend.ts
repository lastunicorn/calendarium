import type { CalendarDay, WeekDay } from './calendar'

/** `days` highlights only weekend cells with a day number; `columns` the whole weekend column. */
export const WEEKEND_HIGHLIGHTS = ['off', 'days', 'columns'] as const
export type WeekendHighlight = (typeof WEEKEND_HIGHLIGHTS)[number]

/** Whether a day cell gets the weekend highlight. */
export function isHighlightedDay(day: CalendarDay, mode: WeekendHighlight): boolean {
	return isHighlighted(day.isWeekend, day.inMonth, mode)
}

/** Whether a week page's day gets the weekend highlight: `days` skips days of another year. */
export function isHighlightedWeekDay(day: WeekDay, mode: WeekendHighlight): boolean {
	return isHighlighted(day.isWeekend, day.inYear, mode)
}

/** `columns` highlights every weekend cell; `days` only those of the period the grid is about. */
function isHighlighted(isWeekend: boolean, inPeriod: boolean, mode: WeekendHighlight): boolean {
	if (!isWeekend) return false
	return mode === 'columns' || (mode === 'days' && inPeriod)
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

/**
 * The cells of a week page, in order, each holding the days drawn in it: one day, or Saturday then
 * Sunday when `reduced`. Reducing needs Sunday right after Saturday, so a week starting on
 * Sunday falls back to `full`.
 */
export function weekCells(week: WeekDay[], display: WeekendDisplay): WeekDay[][] {
	if (display === 'hidden') return week.filter((day) => !day.isWeekend).map((day) => [day])
	const saturday = week.findIndex((day) => day.weekday === 6)
	const reduce = display === 'reduced' && week[saturday + 1]?.weekday === 0
	const cells: WeekDay[][] = []
	week.forEach((day, index) => {
		if (reduce && index === saturday + 1) cells.at(-1)!.push(day)
		else cells.push([day])
	})
	return cells
}
