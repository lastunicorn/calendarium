import type { MiniMonthOptions } from '../../layouts/monthGrid'
import { CalendarIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { MonthGridFields } from './MonthGridFields'
import { type ConfigSectionProps, Section } from './Section'

/** Whether a page shows a small month for context, and how it looks. */
export function MiniMonthSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<MiniMonthOptions>) {
	function handleShowChange(show: boolean) {
		onUpdate({ show })
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
				label="Show mini calendar"
				checked={config.show}
				onChange={handleShowChange}
			/>
			{config.show && (
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
