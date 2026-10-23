import type { WeekPerPageOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { WeekPerPageForm } from './WeekPerPageForm'
import { WeekPerPageLayout } from './WeekPerPageLayout'

/** Two pages per week face each other. */
function hasTwoPages(options: WeekPerPageOptions): boolean {
	return options.twoPagesPerWeek
}

export const WEEK_PER_PAGE_VIEW: LayoutView<WeekPerPageOptions> = {
	Component: WeekPerPageLayout,
	Form: WeekPerPageForm,
	name: 'Week',
	label: 'Week (One week per page)',
	facingPages: hasTwoPages,
}
