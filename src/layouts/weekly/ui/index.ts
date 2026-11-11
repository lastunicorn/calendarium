import type { WeeklyOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { WeeklyForm } from './WeeklyForm'
import { WeeklyLayout } from './WeeklyLayout'

/** Two pages per week face each other. */
function hasTwoPages(options: WeeklyOptions): boolean {
	return options.twoPagesPerWeek
}

export const WEEKLY_VIEW: LayoutView<WeeklyOptions> = {
	Component: WeeklyLayout,
	Form: WeeklyForm,
	name: 'Weekly',
	label: 'Weekly (one week per page)',
	facingPages: hasTwoPages,
}
