import type { DayPerPageOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { DayPerPageForm } from './DayPerPageForm'
import { DayPerPageLayout } from './DayPerPageLayout'

/** Two pages per day face each other. */
function hasTwoPages(options: DayPerPageOptions): boolean {
	return options.twoPagesPerDay
}

export const DAY_PER_PAGE_VIEW: LayoutView<DayPerPageOptions> = {
	Component: DayPerPageLayout,
	Form: DayPerPageForm,
	name: 'Day',
	label: 'Day (One day per page)',
	facingPages: hasTwoPages,
}
