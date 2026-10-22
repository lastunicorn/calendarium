import type { YearPerPageOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { YearPerPageForm } from './YearPerPageForm'
import { YearPerPageLayout } from './YearPerPageLayout'

export const YEAR_PER_PAGE_VIEW: LayoutView<YearPerPageOptions> = {
	Component: YearPerPageLayout,
	Form: YearPerPageForm,
	name: 'Year',
	label: 'Year (Whole year on one page)',
}
