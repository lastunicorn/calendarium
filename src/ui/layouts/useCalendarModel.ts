import { useMemo } from 'react'
import type { CommonConfig } from '../../layouts/common'
import { buildYear, type CalendarMonth, type WeekStart } from '../../core/calendar'
import {
	type Locale,
	monthNames,
	resolveWeekStart,
	weekdayNames,
	type WeekdayFormat,
} from '../../core/locale'

/** What every layout draws from: the resolved week start, the year's months and month names. */
export interface CalendarModel {
	weekStart: WeekStart
	/** January first, each 6 weeks from `weekStart` (`buildMonth`). */
	months: CalendarMonth[]
	/** Localized, January first. */
	monthNames: string[]
}

/**
 * The calendar model of `config`, memoized per input as a whole, so it can be a dependency of
 * the hooks that derive from it.
 */
export function useCalendarModel(config: CommonConfig): CalendarModel {
	const { year, locale } = config
	const weekStart = resolveWeekStart(config.weekStart, locale)
	const months = useMemo(() => buildYear(year, weekStart), [year, weekStart])
	const names = useMemo(() => monthNames(locale), [locale])
	return useMemo(() => ({ weekStart, months, monthNames: names }), [weekStart, months, names])
}

/**
 * Localized weekday names ordered from `weekStart`, memoized; one call per drawn element, since
 * each may abbreviate them its own way.
 */
export function useWeekdayNames(locale: Locale, weekStart: WeekStart, format: WeekdayFormat) {
	return useMemo(() => weekdayNames(locale, weekStart, format), [locale, weekStart, format])
}
