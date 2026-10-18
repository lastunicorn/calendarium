import { LOCALES } from '../../config/CalendarConfig'
import type { WeekStart } from '../../core/calendar'
import type { WeekdayFormat } from '../../core/locale'
import { NumberField } from '../fields/NumberField'
import { type Option, SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

/** Week start options in panel order, Monday first. */
const WEEK_START_OPTIONS: Option<WeekStart>[] = [
	{ value: 1, label: 'Monday' },
	{ value: 2, label: 'Tuesday' },
	{ value: 3, label: 'Wednesday' },
	{ value: 4, label: 'Thursday' },
	{ value: 5, label: 'Friday' },
	{ value: 6, label: 'Saturday' },
	{ value: 0, label: 'Sunday' },
]

const WEEKDAY_FORMAT_OPTIONS: Option<WeekdayFormat>[] = [
	{ value: 'short', label: 'Three letters (MON)' },
	{ value: 'narrow', label: 'One letter (M)' },
]

function isValidYear(year: number): boolean {
	return Number.isInteger(year) && year >= 1 && year <= 9999
}

/** Which year, and how dates are named and ordered. */
export function CalendarSection({ config, onUpdate }: ConfigSectionProps) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	function handleLocaleChange(locale: string) {
		onUpdate({ locale })
	}

	function handleWeekStartChange(weekStart: WeekStart) {
		onUpdate({ weekStart })
	}

	function handleWeekdayFormatChange(weekdayFormat: WeekdayFormat) {
		onUpdate({ weekdayFormat })
	}

	return (
		<Section title="Calendar">
			<NumberField
				label="Year"
				value={config.year}
				min={1}
				max={9999}
				isValid={isValidYear}
				onChange={handleYearChange}
			/>
			<SelectField
				label="Language"
				value={config.locale}
				options={LOCALES}
				onChange={handleLocaleChange}
			/>
			<SelectField
				label="Week starts on"
				value={config.weekStart}
				options={WEEK_START_OPTIONS}
				onChange={handleWeekStartChange}
			/>
			<SelectField
				label="Weekday names"
				value={config.weekdayFormat}
				options={WEEKDAY_FORMAT_OPTIONS}
				onChange={handleWeekdayFormatChange}
			/>
		</Section>
	)
}
