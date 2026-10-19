import { useMemo } from 'react'
import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import { weeksOfYear } from '../../../core/calendar'
import { hourNames, resolveWeekStart } from '../../../core/locale'
import { weekCells } from '../../../core/weekend'
import { useCalendarModel } from '../useCalendarModel'
import { WeekPage } from './WeekPage'

interface WeekPerPageLayoutProps {
	config: WeekPerPageConfig
}

/**
 * A page for every week holding a day of the year, from the one with January 1 to the one with
 * December 31; their days of the previous and next year are grayed out. The weekend gets a cell
 * per day, one shared cell, or none, per `weekendDisplay`. Each day of the year in its own cell
 * may hold an hourly schedule, per `weekPageLines`; a shared weekend cell has no room for one.
 */
export function WeekPerPageLayout({ config }: WeekPerPageLayoutProps) {
	const {
		year,
		locale,
		highlightWeekends,
		showWeekNumbers,
		weekendDisplay,
		weekPageLines,
		hourFormat,
		firstHour,
		lastHour,
		page,
	} = config
	const weekStart = resolveWeekStart(config.weekStart, locale)
	const { monthNames, weekdays } = useCalendarModel(config)
	// A week whose only days of the year are a left-out weekend gets no page.
	const pages = useMemo(
		() =>
			weeksOfYear(year, weekStart)
				.map((week) => weekCells(week, weekendDisplay))
				.filter((cells) => cells.some((cell) => cell.some((day) => day.inYear))),
		[year, weekStart, weekendDisplay],
	)
	// Built once here, not per page; the same array for every page keeps their memo working.
	const hours = useMemo(
		() =>
			weekPageLines === 'hours'
				? hourNames(locale, firstHour, lastHour, hourFormat)
				: undefined,
		[weekPageLines, locale, firstHour, lastHour, hourFormat],
	)

	return pages.map((cells) => (
		<WeekPage
			key={cells[0][0].key}
			cells={cells}
			hours={hours}
			weekdays={weekdays}
			weekStart={weekStart}
			monthNames={monthNames}
			locale={locale}
			highlightWeekends={highlightWeekends}
			showWeekNumbers={showWeekNumbers}
			setup={page}
		/>
	))
}
