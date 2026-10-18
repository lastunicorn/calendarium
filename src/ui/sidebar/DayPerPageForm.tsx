import type { DayPerPageConfig } from '../../config/CalendarConfig'
import { AppearanceSection } from './AppearanceSection'
import { CalendarSection } from './CalendarSection'
import { DayPageSection } from './DayPageSection'
import { PageSection } from './PageSection'
import type { ConfigSectionProps } from './Section'

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
