import type { MonthGridOptions } from '../../config/layouts/monthGrid'
import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../../core/weekend'
import { CheckboxField } from '../fields/CheckboxField'
import { optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
import type { ConfigSectionProps } from './Section'

const WEEKDAY_FORMAT_OPTIONS = optionsFrom(WEEKDAY_FORMATS, {
	short: 'Three letters (MON)',
	narrow: 'One letter (M)',
})

const WEEKEND_HIGHLIGHT_OPTIONS = optionsFrom(WEEKEND_HIGHLIGHTS, {
	off: 'Off',
	days: 'Days only',
	columns: 'Whole columns',
})

/** How a month grid names its weekdays, marks its weekends, and whether it numbers its weeks. */
export function MonthGridFields({ config, onUpdate }: ConfigSectionProps<MonthGridOptions>) {
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
				options={WEEKDAY_FORMAT_OPTIONS}
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
				checked={config.showWeekNumbers}
				onChange={handleShowWeekNumbersChange}
			/>
		</>
	)
}
