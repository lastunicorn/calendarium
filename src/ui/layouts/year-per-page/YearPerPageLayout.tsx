import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import { CalendarHeader } from '../CalendarHeader'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'
import { useCalendarModel, useWeekdayNames } from '../useCalendarModel'
import styles from './YearPerPageLayout.module.css'

interface YearPerPageLayoutProps {
	config: YearPerPageConfig
}

/** The whole year on one page: the header above a grid of 12 small months. */
export function YearPerPageLayout({ config }: YearPerPageLayoutProps) {
	const { year, locale, title, subtitle, highlightWeekends, showWeekNumbers, page } = config
	const { weekStart, months, monthNames } = useCalendarModel(config)
	const weekdays = useWeekdayNames(locale, weekStart, config.weekdayFormat)

	return (
		<Page setup={page}>
			<div className={styles.layout}>
				<CalendarHeader heading={title.trim() || String(year)} subheading={subtitle} />

				<div className={`${styles.grid} ${styles[page.orientation]}`}>
					{months.map((month) => (
						<MiniMonth
							key={month.month}
							month={month}
							name={monthNames[month.month]}
							weekdays={weekdays}
							highlightWeekends={highlightWeekends}
							showWeekNumbers={showWeekNumbers}
						/>
					))}
				</div>
			</div>
		</Page>
	)
}
