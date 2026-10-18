import {
	DAY_PAGE_LINES,
	type DayPageLines,
	LAYOUT_IDS,
	type LayoutId,
} from '../../config/CalendarConfig'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const LAYOUT_OPTIONS = optionsFrom(LAYOUT_IDS, {
	'year-one-page': 'Year (Whole year on one page)',
	'month-per-page': 'Month (One month per page)',
	'day-per-page': 'Day (One day per page)',
})

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule (07:00–21:00)',
	ruled: 'Ruled lines',
})

/** How the calendar is spread over pages. */
export function LayoutSection({ config, onUpdate }: ConfigSectionProps) {
	function handleLayoutChange(layout: LayoutId) {
		onUpdate({ layout })
	}

	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	return (
		<Section title="Layout">
			<SelectField
				label="Pages"
				value={config.layout}
				options={LAYOUT_OPTIONS}
				onChange={handleLayoutChange}
			/>
			{config.layout === 'day-per-page' && (
				<SelectField
					label="Day page"
					value={config.dayPageLines}
					options={DAY_PAGE_LINES_OPTIONS}
					onChange={handleDayPageLinesChange}
				/>
			)}
		</Section>
	)
}
