import type { DayPerPageConfig } from '../../../layouts/day-per-page/options'
import type { MiniMonthOptions } from '../../../layouts/monthGrid'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { EventsSection } from '../../sidebar/EventsSection'
import { MiniMonthSection } from '../../sidebar/MiniMonthSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { DayContentSection } from './DayContentSection'
import { HeaderSection } from './HeaderSection'

/** The `day-per-page` options, including its header, what fills each day and its mini calendar. */
export function DayPerPageForm({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<DayPerPageConfig>) {
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
			<DayContentSection config={config} defaults={defaults} onUpdate={onUpdate} />
			<PageSection config={config} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
