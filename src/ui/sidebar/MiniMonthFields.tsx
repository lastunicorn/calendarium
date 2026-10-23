import type { MiniMonthOptions, MiniMonthSize } from '../../layouts/monthGrid'
import { CheckboxField } from '../fields/CheckboxField'
import { RadioField } from '../fields/RadioField'
import { MINI_MONTH_SIZE_OPTIONS } from './fieldOptions'
import { MonthGridFields } from './MonthGridFields'
import type { OptionsFieldsProps } from './Section'

/** How the mini months a page shows look: their size, title and month grid. */
export function MiniMonthFields({
	options,
	onUpdate,
}: OptionsFieldsProps<Omit<MiniMonthOptions, 'show'>>) {
	function handleShowYearChange(showYear: boolean) {
		onUpdate({ showYear })
	}

	function handleSizeChange(size: MiniMonthSize) {
		onUpdate({ size })
	}

	return (
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
	)
}
