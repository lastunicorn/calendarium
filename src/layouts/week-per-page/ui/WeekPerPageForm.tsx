import type { MiniMonthOptions } from '../../monthGrid'
import type { WeekPerPageOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { MiniMonthSection } from '../../../ui/sidebar/MiniMonthSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { HeaderSection } from './HeaderSection'
import { WeekContentSection } from './WeekContentSection'

/**
 * The `week-per-page` options, including its header, how each day is labeled and the weekend drawn,
 * and its mini calendar.
 */
export function WeekPerPageForm({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeekPerPageOptions>) {
	function handleMiniMonthUpdate(patch: Partial<MiniMonthOptions>) {
		onUpdate({ miniMonth: { ...options.miniMonth, ...patch } })
	}

	return (
		<>
			<CalendarSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<MiniMonthSection
				options={options.miniMonth}
				defaults={defaults.miniMonth}
				onUpdate={handleMiniMonthUpdate}
			/>
			<WeekContentSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<PageSection options={options} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
