import type { AdjacentMonthsOptions, MonthPerPageOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { AdjacentMonthsSection } from './AdjacentMonthsSection'
import { HeaderSection } from './HeaderSection'
import { MonthContentSection } from './MonthContentSection'

/** The `month-per-page` options, including its header and the mini months beside it. */
export function MonthPerPageForm({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<MonthPerPageOptions>) {
	function handleAdjacentMonthsUpdate(patch: Partial<AdjacentMonthsOptions>) {
		onUpdate({ adjacentMonths: { ...options.adjacentMonths, ...patch } })
	}

	return (
		<>
			<CalendarSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<AdjacentMonthsSection
				options={options.adjacentMonths}
				defaults={defaults.adjacentMonths}
				onUpdate={handleAdjacentMonthsUpdate}
			/>
			<MonthContentSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<PageSection options={options} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
