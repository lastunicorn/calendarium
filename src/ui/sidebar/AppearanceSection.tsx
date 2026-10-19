import type { CommonConfig } from '../../config/CalendarConfig'
import {
	type Locale,
	LOCALES,
	WEEKDAY_FORMATS,
	type WeekdayFormat,
	type WeekStartSetting,
} from '../../core/locale'
import { WEEKEND_HIGHLIGHTS, type WeekendHighlight } from '../../core/weekend'
import { AppearanceIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { type Option, optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
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

const WEEKDAY_FORMAT_OPTIONS = optionsFrom(WEEKDAY_FORMATS, {
	short: 'Three letters (MON)',
	narrow: 'One letter (M)',
})

const WEEKEND_HIGHLIGHT_OPTIONS = optionsFrom(WEEKEND_HIGHLIGHTS, {
	off: 'Off',
	days: 'Days only',
	columns: 'Whole columns',
})

/** How dates are named and ordered, and what the grid marks. */
export function AppearanceSection({ config, onUpdate }: ConfigSectionProps<CommonConfig>) {
	function handleLocaleChange(locale: Locale) {
		onUpdate({ locale })
	}

	function handleWeekStartChange(weekStart: WeekStartSetting) {
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
		<Section title="Appearance" icon={<AppearanceIcon />}>
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
			<RadioField
				label="Weekday names"
				value={config.weekdayFormat}
				options={WEEKDAY_FORMAT_OPTIONS}
				onChange={handleWeekdayFormatChange}
			/>
			<RadioField
				label="Highlight weekends"
				value={config.highlightWeekends}
				options={WEEKEND_HIGHLIGHT_OPTIONS}
				onChange={handleHighlightWeekendsChange}
			/>
			<CheckboxField
				label="Show week numbers"
				checked={config.showWeekNumbers}
				onChange={handleShowWeekNumbersChange}
			/>
		</Section>
	)
}
