import type { MiniMonthOptions, MiniMonthSize } from '../../layouts/monthGrid'
import { CalendarIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { RadioField } from '../fields/RadioField'
import { MINI_MONTH_SIZE_OPTIONS } from './fieldOptions'
import { MonthGridFields } from './MonthGridFields'
import { type OptionsSectionProps, Section } from './Section'

/** Whether a page shows a small month for context, and how it looks. */
export function MiniMonthSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<MiniMonthOptions>) {
	function handleShowChange(show: boolean) {
		onUpdate({ show })
	}

	function handleShowYearChange(showYear: boolean) {
		onUpdate({ showYear })
	}

	function handleSizeChange(size: MiniMonthSize) {
		onUpdate({ size })
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
					<RadioField
						label="Size"
						value={options.size}
						options={MINI_MONTH_SIZE_OPTIONS}
						onChange={handleSizeChange}
					/>
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
