import type { LayoutView } from '../../../ui/layouts/LayoutView'
import type { MonthlyOptions } from '../options'
import { MonthlyForm } from './MonthlyForm'
import { MonthlyLayout } from './MonthlyLayout'

export const MONTHLY_VIEW: LayoutView<MonthlyOptions> = {
	Component: MonthlyLayout,
	Form: MonthlyForm,
	name: 'Monthly',
	label: 'Monthly (one month per page)',
}
