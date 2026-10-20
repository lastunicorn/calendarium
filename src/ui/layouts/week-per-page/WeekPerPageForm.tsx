import type { MiniMonthOptions } from '../../../layouts/monthGrid'
import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { EventsSection } from '../../sidebar/EventsSection'
import { MiniMonthSection } from '../../sidebar/MiniMonthSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { HeaderSection } from './HeaderSection'
import { WeekContentSection } from './WeekContentSection'

/**
 * The `week-per-page` options, including its header, how each day is labeled and the weekend drawn,
 * and its mini calendar.
 */
export function WeekPerPageForm({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<WeekPerPageConfig>) {
	function handleMiniMonthUpdate(patch: Partial<MiniMonthOptions>) {
		onUpdate({ miniMonth: { ...config.miniMonth, ...patch } })
	}

	return (
		<>
			<CalendarSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<EventsSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<HeaderSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<MiniMonthSection
				config={config.miniMonth}
				defaults={defaults.miniMonth}
				onUpdate={handleMiniMonthUpdate}
			/>
			<WeekContentSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<PageSection config={config} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
