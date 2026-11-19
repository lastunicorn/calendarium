import { isYear, MAX_YEAR, MIN_YEAR } from '../../core/calendar'
import type { Locale, WeekStartSetting } from '../../core/locale'
import type { CalendarOptions } from '../../layouts/common'
import { CalendarIcon } from '../components/icons'
import { ComboboxField } from '../fields/ComboboxField'
import { NumberField } from '../fields/NumberField'
import { SelectField } from '../fields/SelectField'
import { WEEK_START_OPTIONS } from './fieldOptions'
import { LOCALE_OPTIONS } from './localeOptions'
import { Section, type OptionsSectionProps } from './Section'

/** Which year the calendar shows, in which language, and the day its weeks start on. */
export function CalendarSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<CalendarOptions>) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	function handleLocaleChange(locale: Locale) {
		onUpdate({ locale })
	}

	function handleWeekStartChange(weekStart: WeekStartSetting) {
		onUpdate({ weekStart })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section id="calendar" title="Calendar" icon={<CalendarIcon />} onReset={handleReset}>
			<NumberField
				label="Year"
				description={[
					`From ${MIN_YEAR} to ${MAX_YEAR}.`,
					`${MIN_YEAR} is the first full year of the Gregorian calendar.`,
				]}
				value={options.year}
				min={MIN_YEAR}
				max={MAX_YEAR}
				isValid={isYear}
				onChange={handleYearChange}
			/>
			<ComboboxField
				label="Language"
				description={[
					'The language the calendar is printed in. It applies to the printable calendar only.',
					'The language of the editor stays in English.',
				]}
				value={options.locale}
				options={LOCALE_OPTIONS}
				onChange={handleLocaleChange}
			/>
			<SelectField
				label="Week starts on"
				description={[
					'Choose the day to be used as the first day of the week.',
					'"Language default" picks the language’s own day, e.g. Sunday in American English, Monday in German.',
				]}
				value={options.weekStart}
				options={WEEK_START_OPTIONS}
				onChange={handleWeekStartChange}
			/>
		</Section>
	)
}
