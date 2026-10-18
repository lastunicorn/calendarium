import type { WeekendHighlight } from '../../config/CalendarConfig'
import { CheckboxField } from '../fields/CheckboxField'
import { type Option, SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const WEEKEND_HIGHLIGHT_OPTIONS: Option<WeekendHighlight>[] = [
	{ value: 'off', label: 'Off' },
	{ value: 'days', label: 'Days only' },
	{ value: 'columns', label: 'Whole columns' },
]

/** Optional visual extras on the calendar grid. */
export function AppearanceSection({ config, onUpdate }: ConfigSectionProps) {
	function handleHighlightWeekendsChange(highlightWeekends: WeekendHighlight) {
		onUpdate({ highlightWeekends })
	}

	function handleShowWeekNumbersChange(showWeekNumbers: boolean) {
		onUpdate({ showWeekNumbers })
	}

	return (
		<Section title="Appearance">
			<SelectField
				label="Highlight weekends"
				value={config.highlightWeekends}
				options={WEEKEND_HIGHLIGHT_OPTIONS}
				onChange={handleHighlightWeekendsChange}
			/>
			<CheckboxField
				label="Week numbers"
				checked={config.showWeekNumbers}
				onChange={handleShowWeekNumbersChange}
			/>
		</Section>
	)
}
