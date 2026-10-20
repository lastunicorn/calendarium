import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import { planYearPage } from '../../../layouts/year-per-page/pages'
import { CalendarHeader } from '../CalendarHeader'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'
import { usePagePlan } from '../usePagePlan'
import styles from './YearPerPageLayout.module.css'

interface YearPerPageLayoutProps {
	config: YearPerPageConfig
}

/** The whole year on one page, as `planYearPage` plans it: the header above 12 small months. */
export function YearPerPageLayout({ config }: YearPerPageLayoutProps) {
	const { heading, subheading, months } = usePagePlan(planYearPage, config)
	const { page } = config

	return (
		<Page setup={page}>
			<div className={styles.layout}>
				<CalendarHeader heading={heading} subheading={subheading} />

				<div className={`${styles.grid} ${styles[page.orientation]}`}>
					{months.map((month) => (
						<MiniMonth key={month.month.month} {...month} />
					))}
				</div>
			</div>
		</Page>
	)
}
