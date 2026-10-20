import {
	DAY_NUMBER_HORIZONTAL_ALIGNMENTS,
	DAY_NUMBER_VERTICAL_ALIGNMENTS,
	type DayNumberHorizontalAlignment,
	type DayNumberVerticalAlignment,
	type MonthPerPageConfig,
} from '../../../layouts/month-per-page/options'
import { ContentIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { defaultFields } from '../../sidebar/defaultFields'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { MonthGridFields } from '../../sidebar/MonthGridFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const DAY_NUMBER_HORIZONTAL_ALIGNMENT_OPTIONS = optionsFrom(DAY_NUMBER_HORIZONTAL_ALIGNMENTS, {
	left: 'Left',
	center: 'Center',
	right: 'Right',
})

const DAY_NUMBER_VERTICAL_ALIGNMENT_OPTIONS = optionsFrom(DAY_NUMBER_VERTICAL_ALIGNMENTS, {
	top: 'Top',
	center: 'Center',
	bottom: 'Bottom',
})

/**
 * How the month's grid looks, with room for full weekday names, whether it shows other months'
 * days and its lines, and where the day numbers sit in their cells.
 */
export function MonthContentSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<MonthPerPageConfig>) {
	function handleShowAdjacentMonthDaysChange(showAdjacentMonthDays: boolean) {
		onUpdate({ showAdjacentMonthDays })
	}

	function handleShowGridLinesChange(showGridLines: boolean) {
		onUpdate({ showGridLines })
	}

	function handleDayNumberHorizontalAlignmentChange(
		dayNumberHorizontalAlignment: DayNumberHorizontalAlignment,
	) {
		onUpdate({ dayNumberHorizontalAlignment })
	}

	function handleDayNumberVerticalAlignmentChange(
		dayNumberVerticalAlignment: DayNumberVerticalAlignment,
	) {
		onUpdate({ dayNumberVerticalAlignment })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'weekdayFormat',
				'highlightWeekends',
				'showWeekNumbers',
				'showAdjacentMonthDays',
				'showGridLines',
				'dayNumberHorizontalAlignment',
				'dayNumberVerticalAlignment',
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
				label="Show adjacent month days"
				checked={config.showAdjacentMonthDays}
				onChange={handleShowAdjacentMonthDaysChange}
				description="Show days of the previous and next month"
			/>
			<CheckboxField
				label="Show grid lines"
				checked={config.showGridLines}
				onChange={handleShowGridLinesChange}
				description="Rule the cells of the month's grid"
			/>
			<RadioField
				label="Day number horizontal alignment"
				value={config.dayNumberHorizontalAlignment}
				options={DAY_NUMBER_HORIZONTAL_ALIGNMENT_OPTIONS}
				onChange={handleDayNumberHorizontalAlignmentChange}
			/>
			<RadioField
				label="Day number vertical alignment"
				value={config.dayNumberVerticalAlignment}
				options={DAY_NUMBER_VERTICAL_ALIGNMENT_OPTIONS}
				onChange={handleDayNumberVerticalAlignmentChange}
			/>
		</Section>
	)
}
