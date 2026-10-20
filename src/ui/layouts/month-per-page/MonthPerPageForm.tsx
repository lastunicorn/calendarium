import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { EventsSection } from '../../sidebar/EventsSection'
import { ContentSection } from '../../sidebar/ContentSection'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { HeaderSection } from './HeaderSection'

/** The `month-per-page` options, including its header. */
export function MonthPerPageForm({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<MonthPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<ContentSection
				config={config}
				defaults={defaults}
				onUpdate={onUpdate}
				weekdayFormats={WEEKDAY_FORMAT_OPTIONS}
			/>
			<PageSection config={config} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
