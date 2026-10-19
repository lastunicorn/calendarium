import { useMemo } from 'react'
import type { CommonConfig } from '../../config/CalendarConfig'
import { buildYear } from '../../core/calendar'
import { monthNames, resolveWeekStart, weekdayNames } from '../../core/locale'

/** The year's months and localized names that every layout draws from, memoized per input. */
export function useCalendarModel(config: CommonConfig) {
	const { year, locale, weekdayFormat } = config
	const weekStart = resolveWeekStart(config.weekStart, locale)
	const months = useMemo(() => buildYear(year, weekStart), [year, weekStart])
	const names = useMemo(() => monthNames(locale), [locale])
	const weekdays = useMemo(
		() => weekdayNames(locale, weekStart, weekdayFormat),
		[locale, weekStart, weekdayFormat],
	)
	return { months, monthNames: names, weekdays }
}
