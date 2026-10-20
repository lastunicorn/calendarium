import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { planMonthPages } from '../../../layouts/month-per-page/pages'
import { CalendarHeader } from '../CalendarHeader'
import { MonthGrid } from './MonthGrid'
import styles from './MonthPerPageLayout.module.css'
import { Page } from '../Page'
import { usePagePlan } from '../usePagePlan'

interface MonthPerPageLayoutProps {
	config: MonthPerPageConfig
}

/** Twelve pages, each one month under a "January 2026" heading, as `planMonthPages` plans them. */
export function MonthPerPageLayout({ config }: MonthPerPageLayoutProps) {
	const pages = usePagePlan(planMonthPages, config)
	return pages.map((page) => (
		<Page key={page.key} setup={config.page}>
			<div className={styles.layout}>
				<CalendarHeader heading={page.heading} size="compact" />
				<MonthGrid {...page.grid} />
			</div>
		</Page>
	))
}
