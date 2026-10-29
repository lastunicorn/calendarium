import type { MiniMonthOptions } from '../../monthGrid'
import type { WeekPerPageOptions } from '../options'
import { CalendarIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { MiniMonthFields } from '../../../ui/sidebar/MiniMonthFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

/**
 * Whether the week's month and the next are drawn small beside the heading, how they look and
 * whether they circle events.
 */
export function MiniMonthsSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeekPerPageOptions>) {
	const { miniMonth, showNextMonth } = options

	function handleMiniMonthUpdate(patch: Partial<MiniMonthOptions>) {
		onUpdate({ miniMonth: { ...miniMonth, ...patch } })
	}

	function handleShowCurrentMonthChange(show: boolean) {
		handleMiniMonthUpdate({ show })
	}

	function handleShowNextMonthChange(showNextMonth: boolean) {
		onUpdate({ showNextMonth })
	}

	function handleShowEventsChange(showEvents: boolean) {
		handleMiniMonthUpdate({ showEvents })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['miniMonth', 'showNextMonth']))
	}

	return (
		<Section title="Mini calendar" icon={<CalendarIcon />} onReset={handleReset}>
			<CheckboxField
				label="Show current month"
				checked={miniMonth.show}
				onChange={handleShowCurrentMonthChange}
			/>
			<CheckboxField
				label="Show next month"
				checked={showNextMonth}
				onChange={handleShowNextMonthChange}
			/>
			{(miniMonth.show || showNextMonth) && (
				<>
					<MiniMonthFields options={miniMonth} onUpdate={handleMiniMonthUpdate} />
					<CheckboxField
						label="Show events"
						checked={miniMonth.showEvents}
						onChange={handleShowEventsChange}
						description="Circle the days with an event"
					/>
				</>
			)}
		</Section>
	)
}
