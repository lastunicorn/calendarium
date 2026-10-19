import { useMemo } from 'react'
import type { DayPerPageConfig } from '../../../config/layouts/dayPerPage'
import { daysOfYear } from '../../../core/calendar'
import { hourNames } from '../../../core/locale'
import { DayPage } from './DayPage'
import { useCalendarModel } from '../useCalendarModel'

interface DayPerPageLayoutProps {
	config: DayPerPageConfig
}

/** A page for every day of the year: the date, a small month for context, and an hourly schedule or ruled lines. */
export function DayPerPageLayout({ config }: DayPerPageLayoutProps) {
	const {
		dayPageLines,
		hourFormat,
		firstHour,
		lastHour,
		locale,
		highlightWeekends,
		showWeekNumbers,
		page,
	} = config
	const { months, monthNames, weekdays } = useCalendarModel(config)
	const days = useMemo(() => daysOfYear(months), [months])
	// Built once here, not per page: 366 pages would each create a formatter.
	// One row per hour from the first to the last, both shown (the config keeps them in order).
	const hours = useMemo(
		() => hourNames(locale, firstHour, lastHour, hourFormat),
		[locale, firstHour, lastHour, hourFormat],
	)

	return days.map((day) => {
		const month = day.month
		return (
			<DayPage
				key={day.key}
				day={day}
				daysInYear={days.length}
				month={months[month]}
				monthName={monthNames[month]}
				weekdays={weekdays}
				hours={hours}
				lines={dayPageLines}
				locale={locale}
				highlightWeekends={highlightWeekends}
				showWeekNumbers={showWeekNumbers}
				setup={page}
			/>
		)
	})
}
