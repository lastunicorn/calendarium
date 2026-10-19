import type { DayPerPageConfig } from '../../../config/layouts/dayPerPage'
import { AppearanceSection } from '../../sidebar/AppearanceSection'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { DayPageSection } from './DayPageSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `day-per-page` options, including what fills each day. */
export function DayPerPageForm({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<AppearanceSection config={config} onUpdate={onUpdate} />
			<DayPageSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
