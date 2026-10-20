import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { ContentIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { defaultFields } from '../../sidebar/defaultFields'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { MonthGridFields } from '../../sidebar/MonthGridFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

/** How the month's grid looks, with room for full weekday names, and whether it shows other months' days. */
export function MonthContentSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<MonthPerPageConfig>) {
	function handleShowAdjacentMonthDaysChange(showAdjacentMonthDays: boolean) {
		onUpdate({ showAdjacentMonthDays })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'weekdayFormat',
				'highlightWeekends',
				'showWeekNumbers',
				'showAdjacentMonthDays',
			]),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<MonthGridFields
				config={config}
				onUpdate={onUpdate}
				weekdayFormats={WEEKDAY_FORMAT_OPTIONS}
			/>
			<CheckboxField
				label="Show days of the previous and next month"
				checked={config.showAdjacentMonthDays}
				onChange={handleShowAdjacentMonthDaysChange}
			/>
		</Section>
	)
}
