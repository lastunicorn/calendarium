import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import { AppearanceSection } from '../../sidebar/AppearanceSection'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `week-per-page` options. */
export function WeekPerPageForm({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<AppearanceSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
