import type { LayoutView } from '../../../ui/layouts/LayoutView'
import type { WeeklyOptions } from '../options'
import { WeeklyForm } from './WeeklyForm'
import { WeeklyLayout } from './WeeklyLayout'

export const WEEKLY_VIEW: LayoutView<WeeklyOptions> = {
	Component: WeeklyLayout,
	Form: WeeklyForm,
	name: 'Weekly',
	label: 'Weekly (one week per page)',
}
