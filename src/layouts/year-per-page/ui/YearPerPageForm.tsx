import type { YearPerPageOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { HeaderSection } from './HeaderSection'
import { YearContentSection } from './YearContentSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'

/** The `year-per-page` options, including the header above the months and how they look. */
export function YearPerPageForm({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<YearPerPageOptions>) {
	return (
		<>
			<CalendarSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<YearContentSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<PageSection options={options} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
