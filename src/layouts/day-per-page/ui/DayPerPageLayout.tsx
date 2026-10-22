import type { DayPerPageOptions } from '../options'
import { planDayPages } from '../pages'
import { usePagePlan } from '../../../ui/layouts/usePagePlan'
import { DayPage } from './DayPage'

interface DayPerPageLayoutProps {
	options: DayPerPageOptions
}

/** A page, or two, for every day of the year, as `planDayPages` plans them. */
export function DayPerPageLayout({ options }: DayPerPageLayoutProps) {
	const days = usePagePlan(planDayPages, options)
	return days.map((day) => <DayPage key={day.day.key} plan={day} setup={options.page} />)
}
