import { useMemo } from 'react'
import type { CalendarConfig } from '../../config/CalendarConfig'
import { daysOfYear } from '../../core/calendar'
import { DayPage } from './DayPage'
import { useCalendarModel } from './useCalendarModel'

interface DayPerPageLayoutProps {
	config: CalendarConfig
}

/** A page for every day of the year: the date, a small month for context, and lines to write on. */
export function DayPerPageLayout({ config }: DayPerPageLayoutProps) {
	const { locale, title, subtitle, highlightWeekends, showWeekNumbers, page } = config
	const { months, monthNames, weekdays } = useCalendarModel(config)
	const days = useMemo(() => daysOfYear(months), [months])
	const subheading = [title.trim(), subtitle.trim()].filter(Boolean).join(' · ')

	return days.map((day) => {
		const month = day.date.getMonth()
		return (
			<DayPage
				key={day.date.toISOString()}
				day={day}
				daysInYear={days.length}
				month={months[month]}
				monthName={monthNames[month]}
				weekdays={weekdays}
				locale={locale}
				subheading={subheading}
				highlightWeekends={highlightWeekends}
				showWeekNumbers={showWeekNumbers}
				setup={page}
			/>
		)
	})
}
