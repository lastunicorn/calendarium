import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { EventsSection } from '../../sidebar/EventsSection'
import { ContentSection } from '../../sidebar/ContentSection'
import { HeaderSection } from './HeaderSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `year-per-page` options, including the header above the months and how they look. */
export function YearPerPageForm({ config, onUpdate }: ConfigSectionProps<YearPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<EventsSection config={config} onUpdate={onUpdate} />
			<HeaderSection config={config} onUpdate={onUpdate} />
			<ContentSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
