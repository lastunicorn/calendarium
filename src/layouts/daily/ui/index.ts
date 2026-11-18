import type { LayoutView } from '../../../ui/layouts/LayoutView'
import type { DailyOptions } from '../options'
import { DailyForm } from './DailyForm'
import { DailyLayout } from './DailyLayout'

export const DAILY_VIEW: LayoutView<DailyOptions> = {
	Component: DailyLayout,
	Form: DailyForm,
	name: 'Daily',
	label: 'Daily (one day per page)',
}
