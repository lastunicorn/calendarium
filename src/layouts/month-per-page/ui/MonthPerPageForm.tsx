import type { AdjacentMonthsOptions, MonthPerPageConfig } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { ConfigSectionProps } from '../../../ui/sidebar/Section'
import { AdjacentMonthsSection } from './AdjacentMonthsSection'
import { HeaderSection } from './HeaderSection'
import { MonthContentSection } from './MonthContentSection'

/** The `month-per-page` options, including its header and the mini months beside it. */
export function MonthPerPageForm({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<MonthPerPageConfig>) {
	function handleAdjacentMonthsUpdate(patch: Partial<AdjacentMonthsOptions>) {
		onUpdate({ adjacentMonths: { ...config.adjacentMonths, ...patch } })
	}

	return (
		<>
			<CalendarSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<AdjacentMonthsSection
				config={config.adjacentMonths}
				defaults={defaults.adjacentMonths}
				onUpdate={handleAdjacentMonthsUpdate}
			/>
			<MonthContentSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<PageSection config={config} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
