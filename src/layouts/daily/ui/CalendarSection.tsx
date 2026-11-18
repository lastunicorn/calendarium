import { isYear, MAX_YEAR, MIN_YEAR } from '../../../core/calendar'
import type { Locale, WeekStartSetting } from '../../../core/locale'
import { CalendarIcon } from '../../../ui/components/icons'
import { ComboboxField } from '../../../ui/fields/ComboboxField'
import { NumberField } from '../../../ui/fields/NumberField'
import { optionsFrom } from '../../../ui/fields/options'
import { SelectField } from '../../../ui/fields/SelectField'
import { WEEK_START_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { LOCALE_OPTIONS } from '../../../ui/sidebar/localeOptions'
import { Section, type OptionsSectionProps } from '../../../ui/sidebar/Section'
import { DAY_PAGE_MONTHS, type DailyCalendarOptions, type DayPageMonth } from '../options'

const DAY_PAGE_MONTH_OPTIONS = optionsFrom(DAY_PAGE_MONTHS, {
	all: 'Whole year',
	1: 'January',
	2: 'February',
	3: 'March',
	4: 'April',
	5: 'May',
	6: 'June',
	7: 'July',
	8: 'August',
	9: 'September',
	10: 'October',
	11: 'November',
	12: 'December',
})

/**
 * Which year the calendar shows, the month whose days it prints, in which language, and the day
 * its weeks start on.
 */
export function CalendarSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<DailyCalendarOptions>) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	function handleMonthChange(month: DayPageMonth) {
		onUpdate({ month })
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
		<Section title="Calendar" icon={<CalendarIcon />} onReset={handleReset}>
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
			<SelectField
				label="Month"
				description="Print the days of one month only, or of the whole year."
				value={options.month}
				options={DAY_PAGE_MONTH_OPTIONS}
				onChange={handleMonthChange}
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
