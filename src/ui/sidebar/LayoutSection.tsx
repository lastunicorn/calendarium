import {
	DAY_PAGE_LINES,
	type DayPageLines,
	isHour,
	LAYOUT_IDS,
	type LayoutId,
	MAX_HOUR,
	MIN_HOUR,
} from '../../config/CalendarConfig'
import { HOUR_FORMATS, type HourFormat } from '../../core/locale'
import { NumberField } from '../fields/NumberField'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const LAYOUT_OPTIONS = optionsFrom(LAYOUT_IDS, {
	'year-one-page': 'Year (Whole year on one page)',
	'month-per-page': 'Month (One month per page)',
	'day-per-page': 'Day (One day per page)',
})

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
})

const HOUR_FORMAT_OPTIONS = optionsFrom(HOUR_FORMATS, {
	auto: 'Language default',
	'12h': '12-hour (7:00 AM)',
	'24h': '24-hour (07:00)',
})

/** How the calendar is spread over pages. */
export function LayoutSection({ config, onUpdate }: ConfigSectionProps) {
	function handleLayoutChange(layout: LayoutId) {
		onUpdate({ layout })
	}

	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	function handleHourFormatChange(hourFormat: HourFormat) {
		onUpdate({ hourFormat })
	}

	function handleFirstHourChange(firstHour: number) {
		onUpdate({ firstHour })
	}

	function handleLastHourChange(lastHour: number) {
		onUpdate({ lastHour })
	}

	// Each bound stops at the other, so the range can't be turned around.
	function isValidFirstHour(hour: number) {
		return isHour(hour) && hour <= config.lastHour
	}

	function isValidLastHour(hour: number) {
		return isHour(hour) && hour >= config.firstHour
	}

	const showSchedule = config.layout === 'day-per-page' && config.dayPageLines === 'hours'

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
			{showSchedule && (
				<>
					<SelectField
						label="Hour format"
						value={config.hourFormat}
						options={HOUR_FORMAT_OPTIONS}
						onChange={handleHourFormatChange}
					/>
					<NumberField
						label="First hour"
						value={config.firstHour}
						min={MIN_HOUR}
						max={config.lastHour}
						isValid={isValidFirstHour}
						onChange={handleFirstHourChange}
					/>
					<NumberField
						label="Last hour"
						value={config.lastHour}
						min={config.firstHour}
						max={MAX_HOUR}
						isValid={isValidLastHour}
						onChange={handleLastHourChange}
					/>
				</>
			)}
		</Section>
	)
}
