import { useMemo } from 'react'
import type { CommonConfig } from '../../config/CalendarConfig'
import { buildYear, type WeekStart } from '../../core/calendar'
import {
	type Locale,
	monthNames,
	resolveWeekStart,
	weekdayNames,
	type WeekdayFormat,
} from '../../core/locale'

/** The year's months and month names that every layout draws from, memoized per input. */
export function useCalendarModel(config: CommonConfig) {
	const { year, locale } = config
	const weekStart = resolveWeekStart(config.weekStart, locale)
	const months = useMemo(() => buildYear(year, weekStart), [year, weekStart])
	const names = useMemo(() => monthNames(locale), [locale])
	return { weekStart, months, monthNames: names }
}

/**
 * Localized weekday names ordered from `weekStart`, memoized; one call per drawn element, since
 * each may abbreviate them its own way.
 */
export function useWeekdayNames(locale: Locale, weekStart: WeekStart, format: WeekdayFormat) {
	return useMemo(() => weekdayNames(locale, weekStart, format), [locale, weekStart, format])
}
