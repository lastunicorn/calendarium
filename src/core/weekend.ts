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
