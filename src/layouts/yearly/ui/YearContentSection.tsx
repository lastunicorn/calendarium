import type { MonthSize, YearlyContent } from '../options'
import { ContentIcon } from '../../../ui/components/icons'
import { RadioField } from '../../../ui/fields/RadioField'
import { MonthGridFields } from '../../../ui/sidebar/MonthGridFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'
import { MONTH_SIZE_OPTIONS } from './fieldOptions'

/** How the year page's month grids look: their size and their grid. */
export function YearContentSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<YearlyContent>) {
	function handleMonthSizeChange(monthSize: MonthSize) {
		onUpdate({ monthSize })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<RadioField
				label="Month size"
				value={options.monthSize}
				options={MONTH_SIZE_OPTIONS}
				onChange={handleMonthSizeChange}
				description="How large each month's text is; the months fill the page either way"
			/>
			<MonthGridFields options={options} onUpdate={onUpdate} />
		</Section>
	)
}
