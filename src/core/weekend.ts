import type { CalendarDay } from './calendar'

/** `days` highlights only weekend cells with a day number; `columns` the whole weekend column. */
export const WEEKEND_HIGHLIGHTS = ['off', 'days', 'columns'] as const
export type WeekendHighlight = (typeof WEEKEND_HIGHLIGHTS)[number]

/** Whether a day cell gets the weekend highlight. */
export function isHighlightedDay(day: CalendarDay, mode: WeekendHighlight): boolean {
	if (!day.isWeekend) return false
	return mode === 'columns' || (mode === 'days' && day.inMonth)
}

/** Whether the weekday heading above `day`'s column gets the weekend highlight. */
export function isHighlightedColumn(day: CalendarDay, mode: WeekendHighlight): boolean {
	return mode !== 'off' && day.isWeekend
}
