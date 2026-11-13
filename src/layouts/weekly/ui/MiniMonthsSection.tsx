import { CalendarIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { MiniMonthFields } from '../../../ui/sidebar/MiniMonthFields'
import { Section, type OptionsSectionProps } from '../../../ui/sidebar/Section'
import type { WeeklyMiniMonth } from '../options'

/**
 * Whether the week's month and the next are drawn small beside the heading, how they look and
 * whether they circle events.
 */
export function MiniMonthsSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeeklyMiniMonth>) {
	function handleShowCurrentMonthChange(showCurrentMonth: boolean) {
		onUpdate({ showCurrentMonth })
	}

	function handleShowNextMonthChange(showNextMonth: boolean) {
		onUpdate({ showNextMonth })
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
				label="Show current month"
				checked={options.showCurrentMonth}
				onChange={handleShowCurrentMonthChange}
			/>
			<CheckboxField
				label="Show next month"
				checked={options.showNextMonth}
				onChange={handleShowNextMonthChange}
			/>
			{(options.showCurrentMonth || options.showNextMonth) && (
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
