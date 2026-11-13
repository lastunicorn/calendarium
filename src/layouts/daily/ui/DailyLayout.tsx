import { usePagePlan } from '../../../ui/layouts/usePagePlan'
import type { DailyOptions } from '../options'
import { planDayPages } from '../pages'
import { DayPage } from './DayPage'

interface DailyLayoutProps {
	options: DailyOptions
}

/** A page, or two, for every day of the year, as `planDayPages` plans them. */
export function DailyLayout({ options }: DailyLayoutProps) {
	const days = usePagePlan(planDayPages, options)
	return days.map((day) => <DayPage key={day.day.key} plan={day} setup={options.page} />)
}
