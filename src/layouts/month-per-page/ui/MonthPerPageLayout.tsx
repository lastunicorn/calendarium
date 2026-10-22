import type { MonthPerPageConfig } from '../options'
import { planMonthPages } from '../pages'
import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { MonthGrid } from './MonthGrid'
import styles from './MonthPerPageLayout.module.css'
import { Page } from '../../../ui/layouts/Page'
import { usePagePlan } from '../../../ui/layouts/usePagePlan'

interface MonthPerPageLayoutProps {
	config: MonthPerPageConfig
}

/**
 * Twelve pages, each one month under a "January 2026" heading, or the title above it, between the
 * previous and the next month drawn small, as `planMonthPages` plans them.
 */
export function MonthPerPageLayout({ config }: MonthPerPageLayoutProps) {
	const pages = usePagePlan(planMonthPages, config)
	return pages.map((page) => (
		<Page key={page.key} setup={config.page}>
			<div className={styles.layout}>
				<div
					className={`${styles.top} ${page.previousMonth || page.nextMonth ? styles.withMiniMonths : ''}`}
				>
					{page.previousMonth && (
						<div className={`${styles.miniMonth} ${styles.previous}`}>
							<MiniMonth {...page.previousMonth} size="small" />
						</div>
					)}
					<div className={styles.heading}>
						<CalendarHeader
							heading={page.heading}
							subheading={page.subheading}
							size="compact"
							align={page.headingAlign}
						/>
					</div>
					{page.nextMonth && (
						<div className={`${styles.miniMonth} ${styles.next}`}>
							<MiniMonth {...page.nextMonth} size="small" />
						</div>
					)}
				</div>
				<MonthGrid {...page.grid} />
			</div>
		</Page>
	))
}
