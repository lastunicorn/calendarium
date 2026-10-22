import { type HourSchedule, isHour, MAX_HOUR, MIN_HOUR } from '../../layouts/schedule'
import { HOUR_FORMATS, type HourFormat } from '../../core/locale'
import { NumberField } from '../fields/NumberField'
import { optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
import type { OptionsFieldsProps } from './Section'

const HOUR_FORMAT_OPTIONS = optionsFrom(HOUR_FORMATS, {
	auto: 'Language default',
	'12h': '12-hour (7:00 AM)',
	'24h': '24-hour (07:00)',
})

/** The hours of a layout's hourly schedule and the clock they are labeled in. */
export function ScheduleFields({ options, onUpdate }: OptionsFieldsProps<HourSchedule>) {
	function handleHourFormatChange(hourFormat: HourFormat) {
		onUpdate({ hourFormat })
	}

	function handleFirstHourChange(firstHour: number) {
		onUpdate({ firstHour })
	}

	function handleLastHourChange(lastHour: number) {
		onUpdate({ lastHour })
	}

	// Each bound stops at the other, so the range can't be turned around while typing; the schedule's
	// normalize would put a reversed range in order anyway (`orderHours` in `layouts/schedule.ts`).
	function isValidFirstHour(hour: number) {
		return isHour(hour) && hour <= options.lastHour
	}

	function isValidLastHour(hour: number) {
		return isHour(hour) && hour >= options.firstHour
	}

	return (
		<>
			<RadioField
				label="Hour format"
				value={options.hourFormat}
				options={HOUR_FORMAT_OPTIONS}
				onChange={handleHourFormatChange}
			/>
			<NumberField
				label="First hour"
				value={options.firstHour}
				min={MIN_HOUR}
				max={options.lastHour}
				isValid={isValidFirstHour}
				onChange={handleFirstHourChange}
			/>
			<NumberField
				label="Last hour"
				value={options.lastHour}
				min={options.firstHour}
				max={MAX_HOUR}
				isValid={isValidLastHour}
				onChange={handleLastHourChange}
			/>
		</>
	)
}
