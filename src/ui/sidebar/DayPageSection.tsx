import {
	DAY_PAGE_LINES,
	type DayPageLines,
	type DayPerPageConfig,
	isHour,
	MAX_HOUR,
	MIN_HOUR,
} from '../../config/CalendarConfig'
import { HOUR_FORMATS, type HourFormat } from '../../core/locale'
import { NumberField } from '../fields/NumberField'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
})

const HOUR_FORMAT_OPTIONS = optionsFrom(HOUR_FORMATS, {
	auto: 'Language default',
	'12h': '12-hour (7:00 AM)',
	'24h': '24-hour (07:00)',
})

/** What fills a day's page: an hourly schedule and its hours, or ruled lines. */
export function DayPageSection({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
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

	return (
		<Section title="Day page">
			<SelectField
				label="Fill"
				value={config.dayPageLines}
				options={DAY_PAGE_LINES_OPTIONS}
				onChange={handleDayPageLinesChange}
			/>
			{config.dayPageLines === 'hours' && (
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
