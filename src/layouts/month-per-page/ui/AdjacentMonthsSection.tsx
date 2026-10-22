import type { AdjacentMonthsOptions } from '../options'
import { CalendarIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { MonthGridFields } from '../../../ui/sidebar/MonthGridFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

/** Whether the previous and the next month are drawn small beside the heading, and how they look. */
export function AdjacentMonthsSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<AdjacentMonthsOptions>) {
	function handleShowPreviousMonthChange(showPreviousMonth: boolean) {
		onUpdate({ showPreviousMonth })
	}

	function handleShowNextMonthChange(showNextMonth: boolean) {
		onUpdate({ showNextMonth })
	}

	function handleShowYearChange(showYear: boolean) {
		onUpdate({ showYear })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Mini calendar" icon={<CalendarIcon />} onReset={handleReset}>
			<CheckboxField
				label="Show previous month"
				checked={options.showPreviousMonth}
				onChange={handleShowPreviousMonthChange}
			/>
			<CheckboxField
				label="Show next month"
				checked={options.showNextMonth}
				onChange={handleShowNextMonthChange}
			/>
			{(options.showPreviousMonth || options.showNextMonth) && (
				<>
					<CheckboxField
						label="Show year in title"
						checked={options.showYear}
						onChange={handleShowYearChange}
						description="Name the year after the month, or the month alone"
					/>
					<MonthGridFields options={options} onUpdate={onUpdate} />
				</>
			)}
		</Section>
	)
}
