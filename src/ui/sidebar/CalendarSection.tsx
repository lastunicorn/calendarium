import { type CommonConfig, isYear, MAX_YEAR, MIN_YEAR } from '../../config/CalendarConfig'
import { type Locale, LOCALES, type WeekStartSetting } from '../../core/locale'
import { CalendarIcon } from '../components/icons'
import { NumberField } from '../fields/NumberField'
import { type Option, optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
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

const YEAR_DESCRIPTION = `Min value: ${MIN_YEAR} - The first full year of the Gregorian calendar`

/** Which year the calendar shows, in which language, and the day its weeks start on. */
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
		</Section>
	)
}
