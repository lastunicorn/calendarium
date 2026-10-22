import type { MonthPerPageOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { MonthPerPageForm } from './MonthPerPageForm'
import { MonthPerPageLayout } from './MonthPerPageLayout'

export const MONTH_PER_PAGE_VIEW: LayoutView<MonthPerPageOptions> = {
	Component: MonthPerPageLayout,
	Form: MonthPerPageForm,
	name: 'Month',
	label: 'Month (One month per page)',
}
