import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { Page } from '../../../ui/layouts/Page'
import { usePagePlan } from '../../../ui/layouts/usePagePlan'
import type { YearlyOptions } from '../options'
import { planYearPage } from '../pages'
import { EventList } from './EventList'
import styles from './YearlyLayout.module.css'

interface YearlyLayoutProps {
	options: YearlyOptions
}

/**
 * The whole year on one page, as `planYearPage` plans it: the header above 12 small months, then
 * the year's events on a page of their own when it has any.
 */
export function YearlyLayout({ options }: YearlyLayoutProps) {
	const { heading, subheading, headingFontSize, months, eventList } = usePagePlan(
		planYearPage,
		options,
	)
	const { page, content } = options

	return (
		<>
			<Page setup={page}>
				<div className={styles.layout}>
					<CalendarHeader
						heading={heading}
						subheading={subheading}
						headingFontSize={headingFontSize}
					/>

					<div
						className={`${styles.grid} ${styles[page.orientation]} ${styles[content.monthSize]} ${content.showWeekNumbers ? styles.withWeekNumbers : ''}`}
					>
						{months.map((month) => (
							<MiniMonth key={month.month.month} {...month} />
						))}
					</div>
				</div>
			</Page>
			{eventList && (
				<Page setup={page}>
					<EventList {...eventList} />
				</Page>
			)}
		</>
	)
}
