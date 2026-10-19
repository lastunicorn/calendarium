import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import type { LayoutView } from '../LayoutView'
import { WeekPerPageForm } from './WeekPerPageForm'
import { WeekPerPageLayout } from './WeekPerPageLayout'

export const WEEK_PER_PAGE_VIEW: LayoutView<WeekPerPageConfig> = {
	Component: WeekPerPageLayout,
	Form: WeekPerPageForm,
	name: 'Week',
	label: 'Week (One week per page)',
}
