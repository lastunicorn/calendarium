import { Page } from '../../../ui/layouts/Page'
import { usePagePlan } from '../../../ui/layouts/usePagePlan'
import type { WeeklyOptions } from '../options'
import { planWeekPages } from '../pages'
import { WeekPage } from './WeekPage'

interface WeeklyLayoutProps {
	options: WeeklyOptions
}

/**
 * A page, or two, for every week holding a day of the year, maybe after a blank page, as
 * `planWeekPages` plans them.
 */
export function WeeklyLayout({ options }: WeeklyLayoutProps) {
	const { blankFirstPage, hours, weeks } = usePagePlan(planWeekPages, options)
	return (
		<>
			{blankFirstPage && <Page setup={options.page} />}
			{weeks.map((week) => (
				<WeekPage key={week.key} plan={week} hours={hours} setup={options.page} />
			))}
		</>
	)
}
