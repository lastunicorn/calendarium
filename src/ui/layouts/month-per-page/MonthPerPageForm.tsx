import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { AppearanceSection } from '../../sidebar/AppearanceSection'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `month-per-page` options. */
export function MonthPerPageForm({ config, onUpdate }: ConfigSectionProps<MonthPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<AppearanceSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
