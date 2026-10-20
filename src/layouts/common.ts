import { isYear } from '../core/calendar'
import { isWeekStartSetting, type Locale, LOCALES, type WeekStartSetting } from '../core/locale'
import { margins, PAGE_VALIDATORS, type PageSetup } from '../core/paper'
import { oneOf, type Validators } from '../core/validation'

/** Options every layout has, each with the same meaning in all of them. */
export interface CommonConfig {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	/** A fixed first day of the week, or `auto` for the language's own. */
	weekStart: WeekStartSetting
	page: PageSetup
}

/**
 * The browser's language when the calendar has it, so a German browser starts in German.
 * English, of any region, and unsupported languages start in British English.
 */
function defaultLocale(): Locale {
	const language = globalThis.navigator?.language.slice(0, 2)
	if (language === undefined || language === 'en') return 'en-GB'
	return LOCALES.find((locale) => locale.startsWith(language)) ?? 'en-GB'
}

/** The options shared by every layout, with the values all layouts start from. */
export function commonDefaults(): CommonConfig {
	return {
		year: new Date().getFullYear(),
		locale: defaultLocale(),
		weekStart: 'auto',
		page: {
			paperSize: 'a4',
			orientation: 'portrait',
			margins: margins(12),
			mirrorMargins: false,
		},
	}
}

/** The validators of the options every layout has; each layout's spec extends them. */
export const COMMON_VALIDATORS: Validators<CommonConfig> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStartSetting,
	page: PAGE_VALIDATORS,
}
