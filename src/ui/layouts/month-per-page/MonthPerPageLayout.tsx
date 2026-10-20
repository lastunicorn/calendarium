import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { monthYearName } from '../../../core/locale'
import { CalendarHeader } from '../CalendarHeader'
import { MonthGrid } from './MonthGrid'
import styles from './MonthPerPageLayout.module.css'
import { Page } from '../Page'
import { useCalendarModel, useWeekdayNames } from '../useCalendarModel'

interface MonthPerPageLayoutProps {
	config: MonthPerPageConfig
}

/** Twelve pages, each one month under a "January 2026" heading. */
export function MonthPerPageLayout({ config }: MonthPerPageLayoutProps) {
	const { year, locale, highlightWeekends, showWeekNumbers, page } = config
	const { weekStart, months } = useCalendarModel(config)
	const weekdays = useWeekdayNames(locale, weekStart, config.weekdayFormat)

	return months.map((month) => (
		<Page key={month.month} setup={page}>
			<div className={styles.layout}>
				<CalendarHeader heading={monthYearName(locale, year, month.month)} size="compact" />
				<MonthGrid
					month={month}
					weekdays={weekdays}
					highlightWeekends={highlightWeekends}
					showWeekNumbers={showWeekNumbers}
				/>
			</div>
		</Page>
	))
}
