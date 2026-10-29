import type { WeekPerPageOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { FooterSection } from '../../../ui/sidebar/FooterSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { HeaderSection } from './HeaderSection'
import { MiniMonthsSection } from './MiniMonthsSection'
import { WeekContentSection } from './WeekContentSection'

const FOOTER_DESCRIPTION = 'An empty space under the days, on every page.'

/**
 * The `week-per-page` options, including its header, how each day is labeled and the weekend drawn,
 * and its mini calendars.
 */
export function WeekPerPageForm({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeekPerPageOptions>) {
	return (
		<>
			<CalendarSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<MiniMonthsSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<WeekContentSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<FooterSection
				options={options}
				defaults={defaults}
				description={FOOTER_DESCRIPTION}
				onUpdate={onUpdate}
			/>
			<PageSection options={options} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
