import type { MonthPerPageOptions } from '../options'
import { planMonthPages } from '../pages'
import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { miniMonthSizeClass } from '../../../ui/layouts/miniMonthSize'
import { MonthGrid } from './MonthGrid'
import styles from './MonthPerPageLayout.module.css'
import { Page } from '../../../ui/layouts/Page'
import { usePagePlan } from '../../../ui/layouts/usePagePlan'

interface MonthPerPageLayoutProps {
	options: MonthPerPageOptions
}

/**
 * Twelve pages, each one month under a "January 2026" heading, or the title above it, between the
 * previous and the next month drawn small, as `planMonthPages` plans them.
 */
export function MonthPerPageLayout({ options }: MonthPerPageLayoutProps) {
	const pages = usePagePlan(planMonthPages, options)
	return pages.map((page) => {
		const miniMonth = page.previousMonth ?? page.nextMonth
		return (
			<Page key={page.key} setup={options.page}>
				<div className={styles.layout}>
					<div
						className={[
							styles.top,
							miniMonth ? styles.withMiniMonths : '',
							miniMonthSizeClass(miniMonth?.size),
						].join(' ')}
					>
						{page.previousMonth && (
							<div className={`${styles.miniMonth} ${styles.previous}`}>
								<MiniMonth {...page.previousMonth} />
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
								<MiniMonth {...page.nextMonth} />
							</div>
						)}
					</div>
					<MonthGrid {...page.grid} />
				</div>
			</Page>
		)
	})
}
