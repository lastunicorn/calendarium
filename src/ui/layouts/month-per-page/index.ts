import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import type { LayoutView } from '../LayoutView'
import { MonthPerPageForm } from './MonthPerPageForm'
import { MonthPerPageLayout } from './MonthPerPageLayout'

export const MONTH_PER_PAGE_VIEW: LayoutView<MonthPerPageConfig> = {
	Component: MonthPerPageLayout,
	Form: MonthPerPageForm,
	name: 'Month',
	label: 'Month (One month per page)',
}
