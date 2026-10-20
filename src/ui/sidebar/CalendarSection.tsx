import type { CommonConfig } from '../../layouts/common'
import { isYear, MAX_YEAR, MIN_YEAR } from '../../core/calendar'
import { invalidEventLines } from '../../core/events'
import { type Locale, LOCALES, type WeekStartSetting } from '../../core/locale'
import { CalendarIcon } from '../components/icons'
import { NumberField } from '../fields/NumberField'
import { type Option, optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { TextAreaField } from '../fields/TextAreaField'
import { type ConfigSectionProps, Section } from './Section'

/** Week start options in panel order: the language's own day, then Monday to Sunday. */
const WEEK_START_OPTIONS: Option<WeekStartSetting>[] = [
	{ value: 'auto', label: 'Language default' },
	{ value: 1, label: 'Monday' },
	{ value: 2, label: 'Tuesday' },
	{ value: 3, label: 'Wednesday' },
	{ value: 4, label: 'Thursday' },
	{ value: 5, label: 'Friday' },
	{ value: 6, label: 'Saturday' },
	{ value: 0, label: 'Sunday' },
]

/** Each language's name in itself, so a reader can find their own, in alphabetical order. */
const LOCALE_OPTIONS = optionsFrom(LOCALES, {
	'en-US': 'English (US)',
	'en-GB': 'English (UK)',
	'ro-RO': 'Romanian (Română)',
	'de-DE': 'German (Deutsch)',
	'fr-FR': 'French (Français)',
	'es-ES': 'Spanish (Español)',
	'it-IT': 'Italian (Italiano)',
	'ja-JP': 'Japanese (日本語)',
	'pt-BR': 'Portuguese (Português)',
	'nl-NL': 'Dutch (Nederlands)',
	'pl-PL': 'Polish (Polski)',
	'cs-CZ': 'Czech (Čeština)',
	'sk-SK': 'Slovak (Slovenčina)',
	'hu-HU': 'Hungarian (Magyar)',
	'hr-HR': 'Croatian (Hrvatski)',
	'bg-BG': 'Bulgarian (Български)',
	'tr-TR': 'Turkish (Türkçe)',
	'uk-UA': 'Ukrainian (Українська)',
	'ru-RU': 'Russian (Русский)',
	'sv-SE': 'Swedish (Svenska)',
	'da-DK': 'Danish (Dansk)',
	'nb-NO': 'Norwegian (Norsk bokmål)',
	'fi-FI': 'Finnish (Suomi)',
	'zh-CN': 'Chinese (中文, 简体)',
	'ko-KR': 'Korean (한국어)',
}).sort((a, b) => a.label.localeCompare(b.label, 'en'))

const YEAR_DESCRIPTION = [
	`From ${MIN_YEAR} to ${MAX_YEAR}.`,
	`${MIN_YEAR} is the first full year of the Gregorian calendar.`,
]

const EVENTS_DESCRIPTION = [
	'One event per line: its date as year-month-day, a space, then its name, e.g. 2026-04-05 Easter.',
	'The year 0000 repeats an event every year, e.g. 0000-12-25 Christmas.',
	'The month layout writes the names in the days’ cells, the week layout under the days’ labels and the day layout under the page’s heading. The year layout doesn’t show them.',
]

const EVENTS_PLACEHOLDER = '0000-01-01 New Year\n0000-12-25 Christmas\n2026-04-05 Easter'

/** A warning naming the lines of `events` that aren't an event, or none when all are. */
function eventsError(events: string): string | undefined {
	const lines = invalidEventLines(events)
	if (lines.length === 0) return undefined
	const which = lines.length === 1 ? `Line ${lines[0]} is` : `Lines ${lines.join(', ')} are`
	return `${which} not a date and a name (YYYY-MM-DD Name), so not printed.`
}

/** Which year the calendar shows, in which language, the day its weeks start on and its events. */
export function CalendarSection({ config, onUpdate }: ConfigSectionProps<CommonConfig>) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	function handleLocaleChange(locale: Locale) {
		onUpdate({ locale })
	}

	function handleWeekStartChange(weekStart: WeekStartSetting) {
		onUpdate({ weekStart })
	}

	function handleEventsChange(events: string) {
		onUpdate({ events })
	}

	return (
		<Section title="Calendar" icon={<CalendarIcon />}>
			<NumberField
				label="Year"
				description={YEAR_DESCRIPTION}
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
			<TextAreaField
				label="Events"
				description={EVENTS_DESCRIPTION}
				value={config.events}
				placeholder={EVENTS_PLACEHOLDER}
				error={eventsError(config.events)}
				onChange={handleEventsChange}
			/>
		</Section>
	)
}
