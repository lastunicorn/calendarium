import type { CalendarConfig } from '../../config/CalendarConfig'
import { CalendarHeader } from './CalendarHeader'
import { MiniMonth } from './MiniMonth'
import { Page } from './Page'
import { useCalendarModel } from './useCalendarModel'
import styles from './YearOnePageLayout.module.css'

interface YearOnePageLayoutProps {
	config: CalendarConfig
}

/** The whole year on one page: the header above a grid of 12 small months. */
export function YearOnePageLayout({ config }: YearOnePageLayoutProps) {
	const { year, title, subtitle, highlightWeekends, showWeekNumbers } = config
	const { paperSize, orientation, margins } = config
	const { months, monthNames, weekdays } = useCalendarModel(config)

	return (
		<Page paperSize={paperSize} orientation={orientation} margins={margins}>
			<div className={styles.layout}>
				<CalendarHeader year={year} title={title} subtitle={subtitle} />

				<div className={`${styles.grid} ${styles[orientation]}`}>
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
