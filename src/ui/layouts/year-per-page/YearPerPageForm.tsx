import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { EventsSection } from '../../sidebar/EventsSection'
import { HeaderSection } from './HeaderSection'
import { YearContentSection } from './YearContentSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `year-per-page` options, including the header above the months and how they look. */
export function YearPerPageForm({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<YearPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<YearContentSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<PageSection config={config} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
