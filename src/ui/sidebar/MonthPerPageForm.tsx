import type { MonthPerPageConfig } from '../../config/CalendarConfig'
import { AppearanceSection } from './AppearanceSection'
import { CalendarSection } from './CalendarSection'
import { PageSection } from './PageSection'
import type { ConfigSectionProps } from './Section'

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
