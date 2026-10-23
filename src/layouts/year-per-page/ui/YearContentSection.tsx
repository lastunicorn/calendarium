import type { MonthGridOptions } from '../../monthGrid'
import type { MonthSize, YearPerPageOptions } from '../options'
import { ContentIcon } from '../../../ui/components/icons'
import { RadioField } from '../../../ui/fields/RadioField'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { MonthGridFields } from '../../../ui/sidebar/MonthGridFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'
import { MONTH_SIZE_OPTIONS } from './fieldOptions'

type YearContentOptions = MonthGridOptions & Pick<YearPerPageOptions, 'monthSize'>

/** How the year page's month grids look: their size and their grid. */
export function YearContentSection({
	defaults,
	...props
}: OptionsSectionProps<YearContentOptions>) {
	function handleMonthSizeChange(monthSize: MonthSize) {
		props.onUpdate({ monthSize })
	}

	function handleReset() {
		props.onUpdate(
			defaultFields(defaults, [
				'monthSize',
				'weekdayFormat',
				'highlightWeekends',
				'showWeekNumbers',
			]),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<RadioField
				label="Month size"
				value={props.options.monthSize}
				options={MONTH_SIZE_OPTIONS}
				onChange={handleMonthSizeChange}
				description="How large each month's text is; the months fill the page either way"
			/>
			<MonthGridFields {...props} />
		</Section>
	)
}
