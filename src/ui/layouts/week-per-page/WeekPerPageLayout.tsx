import { useMemo } from 'react'
import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import { weeksOfYear } from '../../../core/calendar'
import { resolveWeekStart } from '../../../core/locale'
import { useCalendarModel } from '../useCalendarModel'
import { WeekPage } from './WeekPage'

interface WeekPerPageLayoutProps {
	config: WeekPerPageConfig
}

/**
 * A page for every week holding a day of the year, from the one with January 1 to the one with
 * December 31; their days of the previous and next year are grayed out.
 */
export function WeekPerPageLayout({ config }: WeekPerPageLayoutProps) {
	const { year, locale, highlightWeekends, showWeekNumbers, page } = config
	const weekStart = resolveWeekStart(config.weekStart, locale)
	const { monthNames, weekdays } = useCalendarModel(config)
	const weeks = useMemo(() => weeksOfYear(year, weekStart), [year, weekStart])

	return weeks.map((week) => (
		<WeekPage
			key={week[0].key}
			week={week}
			weekdays={weekdays}
			monthNames={monthNames}
			locale={locale}
			highlightWeekends={highlightWeekends}
			showWeekNumbers={showWeekNumbers}
			setup={page}
		/>
	))
}
