import type { YearlyOptions } from '../options'
import type { LayoutView } from '../../../ui/layouts/LayoutView'
import { YearlyForm } from './YearlyForm'
import { YearlyLayout } from './YearlyLayout'

export const YEARLY_VIEW: LayoutView<YearlyOptions> = {
	Component: YearlyLayout,
	Form: YearlyForm,
	name: 'Yearly',
	label: 'Yearly (the whole year on one page)',
}
