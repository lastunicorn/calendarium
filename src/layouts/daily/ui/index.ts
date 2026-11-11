import type { DailyOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { DailyForm } from './DailyForm'
import { DailyLayout } from './DailyLayout'

/** Two pages per day face each other. */
function hasTwoPages(options: DailyOptions): boolean {
	return options.twoPagesPerDay
}

export const DAILY_VIEW: LayoutView<DailyOptions> = {
	Component: DailyLayout,
	Form: DailyForm,
	name: 'Daily',
	label: 'Daily (one day per page)',
	facingPages: hasTwoPages,
}
