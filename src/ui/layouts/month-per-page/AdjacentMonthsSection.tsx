import type { AdjacentMonthsOptions } from '../../../layouts/month-per-page/options'
import { CalendarIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { MonthGridFields } from '../../sidebar/MonthGridFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

/** Whether the previous and the next month are drawn small beside the heading, and how they look. */
export function AdjacentMonthsSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<AdjacentMonthsOptions>) {
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
				checked={config.showPreviousMonth}
				onChange={handleShowPreviousMonthChange}
			/>
			<CheckboxField
				label="Show next month"
				checked={config.showNextMonth}
				onChange={handleShowNextMonthChange}
			/>
			{(config.showPreviousMonth || config.showNextMonth) && (
				<>
					<CheckboxField
						label="Show year in title"
						checked={config.showYear}
						onChange={handleShowYearChange}
						description="Name the year after the month, or the month alone"
					/>
					<MonthGridFields config={config} onUpdate={onUpdate} />
				</>
			)}
		</Section>
	)
}
