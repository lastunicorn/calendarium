import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import type { LayoutView } from '../LayoutView'
import { YearPerPageForm } from './YearPerPageForm'
import { YearPerPageLayout } from './YearPerPageLayout'

export const YEAR_PER_PAGE_VIEW: LayoutView<YearPerPageConfig> = {
	Component: YearPerPageLayout,
	Form: YearPerPageForm,
	name: 'Year',
	label: 'Year (Whole year on one page)',
}
