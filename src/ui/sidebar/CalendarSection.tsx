import type { CommonOptions } from '../../layouts/common'
import { isYear, MAX_YEAR, MIN_YEAR } from '../../core/calendar'
import { type Locale, LOCALES, type WeekStartSetting } from '../../core/locale'
import { CalendarIcon } from '../components/icons'
import { ComboboxField } from '../fields/ComboboxField'
import { NumberField } from '../fields/NumberField'
import { type Option, optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { defaultFields } from './defaultFields'
import { type OptionsSectionProps, Section } from './Section'

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

/**
 * More words to find a language by: its code, and its language and country names in English and in
 * itself, so "Brasil" or "Deutschland" finds it too.
 */
function localeKeywords(locale: Locale): string[] {
	const { language, region } = new Intl.Locale(locale)
	return [
		locale,
		...['en', locale].flatMap((displayLocale) => [
			new Intl.DisplayNames(displayLocale, { type: 'language' }).of(language),
			region === undefined
				? undefined
				: new Intl.DisplayNames(displayLocale, { type: 'region' }).of(region),
		]),
	].filter((name) => name !== undefined)
}

/** Each language's name in itself, so a reader can find their own, in alphabetical order. */
const LOCALE_OPTIONS = optionsFrom(LOCALES, {
	'en-US': 'English (US)',
	'en-GB': 'English (UK)',
	'ro-RO': 'Romanian (Română)',
	'de-DE': 'German (Deutsch, Deutschland)',
	'fr-FR': 'French (Français, France)',
	'es-ES': 'Spanish (Español, España)',
	'it-IT': 'Italian (Italiano)',
	'ja-JP': 'Japanese (日本語)',
	'pt-BR': 'Portuguese (Português, Brasil)',
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
	'af-ZA': 'Afrikaans',
	'am-ET': 'Amharic (አማርኛ)',
	'ca-ES': 'Catalan (Català)',
	'et-EE': 'Estonian (Eesti)',
	'fil-PH': 'Filipino',
	'gu-IN': 'Gujarati (ગુજરાતી)',
	'hi-IN': 'Hindi (हिन्दी)',
	'id-ID': 'Indonesian (Bahasa Indonesia)',
	'kn-IN': 'Kannada (ಕನ್ನಡ)',
	'lt-LT': 'Lithuanian (Lietuvių)',
	'lv-LV': 'Latvian (Latviešu)',
	'ml-IN': 'Malayalam (മലയാളം)',
	'ms-MY': 'Malay (Bahasa Melayu)',
	'sl-SI': 'Slovenian (Slovenščina)',
	'sr-RS': 'Serbian (Српски)',
	'sw-TZ': 'Swahili (Kiswahili)',
	'ta-IN': 'Tamil (தமிழ்)',
	'te-IN': 'Telugu (తెలుగు)',
	'th-TH': 'Thai (ไทย)',
	'vi-VN': 'Vietnamese (Tiếng Việt)',
	'zh-TW': 'Chinese (中文, 繁體, 台灣)',
	'el-GR': 'Greek (Ελληνικά)',
	'pt-PT': 'Portuguese (Português, Portugal)',
	'es-MX': 'Spanish (Español, México)',
	'fr-CA': 'French (Français, Canada)',
	'de-AT': 'German (Deutsch, Österreich)',
	'de-CH': 'German (Deutsch, Schweiz)',
	'zh-HK': 'Chinese (中文, 繁體, 香港)',
})
	.map((option) => ({ ...option, keywords: localeKeywords(option.value) }))
	.sort((a, b) => a.label.localeCompare(b.label, 'en'))

const YEAR_DESCRIPTION = [
	`From ${MIN_YEAR} to ${MAX_YEAR}.`,
	`${MIN_YEAR} is the first full year of the Gregorian calendar.`,
]

const LOCALE_DESCRIPTION = [
	'The language the calendar is printed in. It applies to the printable calendar only.',
	'The language of the editor stays in English.',
]

const WEEK_START_DESCRIPTION = [
	'Choose the day to be used as the first day of the week.',
	'Language default picks the language’s own day, e.g. Sunday in American English, Monday in German.',
]

/** Which year the calendar shows, in which language, and the day its weeks start on. */
export function CalendarSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<CommonOptions>) {
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
		onUpdate(defaultFields(defaults, ['year', 'locale', 'weekStart']))
	}

	return (
		<Section title="Calendar" icon={<CalendarIcon />} onReset={handleReset}>
			<NumberField
				label="Year"
				description={YEAR_DESCRIPTION}
				value={options.year}
				min={MIN_YEAR}
				max={MAX_YEAR}
				isValid={isYear}
				onChange={handleYearChange}
			/>
			<ComboboxField
				label="Language"
				description={LOCALE_DESCRIPTION}
				value={options.locale}
				options={LOCALE_OPTIONS}
				onChange={handleLocaleChange}
			/>
			<SelectField
				label="Week starts on"
				description={WEEK_START_DESCRIPTION}
				value={options.weekStart}
				options={WEEK_START_OPTIONS}
				onChange={handleWeekStartChange}
			/>
		</Section>
	)
}
