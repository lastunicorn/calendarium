import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { planWeekPages } from '../../../layouts/week-per-page/pages'
import { usePagePlan } from '../usePagePlan'
import { WeekPage } from './WeekPage'

interface WeekPerPageLayoutProps {
	config: WeekPerPageConfig
}

/** A page, or two, for every week holding a day of the year, as `planWeekPages` plans them. */
export function WeekPerPageLayout({ config }: WeekPerPageLayoutProps) {
	const { hours, weeks } = usePagePlan(planWeekPages, config)
	return weeks.map((week) => (
		<WeekPage key={week.key} plan={week} hours={hours} setup={config.page} />
	))
}
