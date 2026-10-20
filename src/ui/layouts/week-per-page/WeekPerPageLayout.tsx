import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { planWeekPages } from '../../../layouts/week-per-page/pages'
import { Page } from '../Page'
import { usePagePlan } from '../usePagePlan'
import { WeekPage } from './WeekPage'

interface WeekPerPageLayoutProps {
	config: WeekPerPageConfig
}

/**
 * A page, or two, for every week holding a day of the year, maybe after a blank page, as
 * `planWeekPages` plans them.
 */
export function WeekPerPageLayout({ config }: WeekPerPageLayoutProps) {
	const { blankFirstPage, hours, weeks } = usePagePlan(planWeekPages, config)
	return (
		<>
			{blankFirstPage && <Page setup={config.page} />}
			{weeks.map((week) => (
				<WeekPage key={week.key} plan={week} hours={hours} setup={config.page} />
			))}
		</>
	)
}
