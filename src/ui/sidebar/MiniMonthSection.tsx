import type { MiniMonthOptions } from '../../layouts/monthGrid'
import { CalendarIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { MiniMonthFields } from './MiniMonthFields'
import { type OptionsSectionProps, Section } from './Section'

/** Whether a page shows a small month for context, how it looks and whether it circles events. */
export function MiniMonthSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<MiniMonthOptions>) {
	function handleShowChange(show: boolean) {
		onUpdate({ show })
	}

	function handleShowEventsChange(showEvents: boolean) {
		onUpdate({ showEvents })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Mini calendar" icon={<CalendarIcon />} onReset={handleReset}>
			<CheckboxField
				label="Show mini calendar"
				checked={options.show}
				onChange={handleShowChange}
			/>
			{options.show && (
				<>
					<MiniMonthFields options={options} onUpdate={onUpdate} />
					<CheckboxField
						label="Show events"
						checked={options.showEvents}
						onChange={handleShowEventsChange}
						description="Circle the days with an event"
					/>
				</>
			)}
		</Section>
	)
}
