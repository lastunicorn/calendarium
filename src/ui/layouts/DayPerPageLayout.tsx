import { useMemo } from 'react'
import type { CalendarConfig } from '../../config/CalendarConfig'
import { daysOfYear } from '../../core/calendar'
import { hourNames } from '../../core/locale'
import { DayPage } from './DayPage'
import { useCalendarModel } from './useCalendarModel'

/** The hours on each page's schedule, 07:00 to 21:00, one row each. */
const FIRST_HOUR = 7
const LAST_HOUR = 21

interface DayPerPageLayoutProps {
	config: CalendarConfig
}

/** A page for every day of the year: the date, a small month for context, and an hourly schedule or ruled lines. */
export function DayPerPageLayout({ config }: DayPerPageLayoutProps) {
	const {
		dayPageLines,
		hourFormat,
		locale,
		title,
		subtitle,
		highlightWeekends,
		showWeekNumbers,
		page,
	} = config
	const { months, monthNames, weekdays } = useCalendarModel(config)
	const days = useMemo(() => daysOfYear(months), [months])
	// Built once here, not per page: 366 pages would each create a formatter.
	const hours = useMemo(
		() => hourNames(locale, FIRST_HOUR, LAST_HOUR, hourFormat),
		[locale, hourFormat],
	)
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
				hours={hours}
				lines={dayPageLines}
				locale={locale}
				subheading={subheading}
				highlightWeekends={highlightWeekends}
				showWeekNumbers={showWeekNumbers}
				setup={page}
			/>
		)
	})
}
