import type { MonthGridOptions } from '../../layouts/monthGrid'
import type { WeekdayFormat } from '../../core/locale'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../../core/weekend'
import { CheckboxField } from '../fields/CheckboxField'
import { type Option, optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
import { WEEK_NUMBER_DESCRIPTION } from './descriptions'
import { MONTH_GRID_WEEKDAY_FORMAT_OPTIONS } from './fieldOptions'
import type { ConfigFieldsProps } from './Section'

const WEEKEND_HIGHLIGHT_OPTIONS = optionsFrom(WEEKEND_HIGHLIGHTS, {
	off: 'Off',
	days: 'Days only',
	columns: 'Whole columns',
})

interface MonthGridFieldsProps extends ConfigFieldsProps<MonthGridOptions> {
	/** The weekday formats the grid has room for; abbreviations only unless it fills a page. */
	weekdayFormats?: readonly Option<WeekdayFormat>[]
}

/** How a month grid names its weekdays, marks its weekends, and whether it numbers its weeks. */
export function MonthGridFields({
	config,
	onUpdate,
	weekdayFormats = MONTH_GRID_WEEKDAY_FORMAT_OPTIONS,
}: MonthGridFieldsProps) {
	function handleWeekdayFormatChange(weekdayFormat: WeekdayFormat) {
		onUpdate({ weekdayFormat })
	}

	function handleHighlightWeekendsChange(highlightWeekends: WeekendHighlight) {
		onUpdate({ highlightWeekends })
	}

	function handleShowWeekNumbersChange(showWeekNumbers: boolean) {
		onUpdate({ showWeekNumbers })
	}

	return (
		<>
			<RadioField
				label="Weekday names"
				value={config.weekdayFormat}
				options={weekdayFormats}
				onChange={handleWeekdayFormatChange}
			/>
			<RadioField
				label="Highlight weekends"
				value={config.highlightWeekends}
				options={WEEKEND_HIGHLIGHT_OPTIONS}
				onChange={handleHighlightWeekendsChange}
			/>
			<CheckboxField
				label="Show week numbers"
				description={WEEK_NUMBER_DESCRIPTION}
				checked={config.showWeekNumbers}
				onChange={handleShowWeekNumbersChange}
			/>
		</>
	)
}
