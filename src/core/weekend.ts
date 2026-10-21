import type { CalendarDay, WeekDay } from './calendar'

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
 * Whether the weekday heading above `day`'s column gets the weekend background too: only in
 * `columns` mode, the heading then being part of the shaded column.
 */
export function isFilledColumnHeading(day: CalendarDay, mode: WeekendHighlight): boolean {
	return mode === 'columns' && day.isWeekend
}
