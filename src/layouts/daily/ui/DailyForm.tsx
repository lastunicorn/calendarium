import type { DailyOptions } from '../options'
import type { MiniMonthOptions } from '../../monthGrid'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { FooterSection } from '../../../ui/sidebar/FooterSection'
import { MiniMonthSection } from '../../../ui/sidebar/MiniMonthSection'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { DayContentSection } from './DayContentSection'
import { HeaderSection } from './HeaderSection'

/** The `daily` options, including its header, what fills each day and its mini calendar. */
export function DailyForm({ options, defaults, onUpdate }: OptionsSectionProps<DailyOptions>) {
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
			<DayContentSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<FooterSection options={options} defaults={defaults} onUpdate={onUpdate} />
			<PageSection options={options} defaults={defaults} onUpdate={onUpdate} />
		</>
	)
}
