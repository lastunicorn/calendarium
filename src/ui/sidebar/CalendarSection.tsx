import {
	isYear,
	type Locale,
	LOCALES,
	MAX_YEAR,
	MIN_YEAR,
	WEEKEND_HIGHLIGHTS,
	type WeekendHighlight,
} from '../../config/CalendarConfig'
import type { WeekStart } from '../../core/calendar'
import { WEEKDAY_FORMATS, type WeekdayFormat } from '../../core/locale'
import { CheckboxField } from '../fields/CheckboxField'
import { NumberField } from '../fields/NumberField'
import { type Option, optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
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

/** Each language's name in itself, so a reader can find their own. */
const LOCALE_OPTIONS = optionsFrom(LOCALES, {
	'en-US': 'English',
	'ro-RO': 'Română',
	'de-DE': 'Deutsch',
	'fr-FR': 'Français',
	'es-ES': 'Español',
	'it-IT': 'Italiano',
	'ja-JP': '日本語',
})

const WEEKDAY_FORMAT_OPTIONS = optionsFrom(WEEKDAY_FORMATS, {
	short: 'Three letters (MON)',
	narrow: 'One letter (M)',
})

const WEEKEND_HIGHLIGHT_OPTIONS = optionsFrom(WEEKEND_HIGHLIGHTS, {
	off: 'Off',
	days: 'Days only',
	columns: 'Whole columns',
})

/** Which year, how dates are named and ordered, and what the grid marks. */
export function CalendarSection({ config, onUpdate }: ConfigSectionProps) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	function handleLocaleChange(locale: Locale) {
		onUpdate({ locale })
	}

	function handleWeekStartChange(weekStart: WeekStart) {
		onUpdate({ weekStart })
	}

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
		<Section title="Calendar">
			<NumberField
				label="Year"
				value={config.year}
				min={MIN_YEAR}
				max={MAX_YEAR}
				isValid={isYear}
				onChange={handleYearChange}
			/>
			<SelectField
				label="Language"
				value={config.locale}
				options={LOCALE_OPTIONS}
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
