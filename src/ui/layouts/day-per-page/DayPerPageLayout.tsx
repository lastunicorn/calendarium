import type { DayPerPageConfig } from '../../../layouts/day-per-page/options'
import { planDayPages } from '../../../layouts/day-per-page/pages'
import { usePagePlan } from '../usePagePlan'
import { DayPage } from './DayPage'

interface DayPerPageLayoutProps {
	config: DayPerPageConfig
}

/** A page, or two, for every day of the year, as `planDayPages` plans them. */
export function DayPerPageLayout({ config }: DayPerPageLayoutProps) {
	const days = usePagePlan(planDayPages, config)
	return days.map((day) => <DayPage key={day.day.key} plan={day} setup={config.page} />)
}
