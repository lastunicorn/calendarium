import { buildYear, type CalendarMonth, isYear, type WeekStart } from '../core/calendar'
import { type CalendarEvent, parseEvents } from '../core/events'
import {
	isWeekStartSetting,
	type Locale,
	LOCALES,
	monthNames,
	resolveWeekStart,
	type WeekStartSetting,
} from '../core/locale'
import { margins, PAGE_VALIDATORS, type PageSetup } from '../core/paper'
import { isString, oneOf, type Validators } from '../core/validation'

/** Options every layout has, each with the same meaning in all of them. */
export interface CommonConfig {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	/** A fixed first day of the week, or `auto` for the language's own. */
	weekStart: WeekStartSetting
	/**
	 * Named days, one per line: `YYYY-MM-DD` and the name, the year `0000` for every year
	 * (`parseEvents`). Kept as typed, invalid lines too, so editing never loses text.
	 */
	events: string
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
		events: '',
		page: {
			paperSize: 'a4',
			orientation: 'portrait',
			margins: margins(12),
			mirrorMargins: false,
			spine: 'left',
		},
	}
}

/** The validators of the options every layout has; each layout's spec extends them. */
export const COMMON_VALIDATORS: Validators<CommonConfig> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStartSetting,
	events: isString,
	page: PAGE_VALIDATORS,
}

/**
 * What every layout's pages are planned from: the resolved week start, the year's months, month
 * names and events.
 */
export interface CalendarModel {
	weekStart: WeekStart
	/** January first, each 6 weeks from `weekStart` (`buildMonth`). */
	months: CalendarMonth[]
	/** Localized, January first. */
	monthNames: string[]
	/** The valid lines of `events`, in order. */
	events: CalendarEvent[]
}

/** The calendar model of a layout's options. */
export function calendarModel(config: CommonConfig): CalendarModel {
	const weekStart = resolveWeekStart(config.weekStart, config.locale)
	return {
		weekStart,
		months: buildYear(config.year, weekStart),
		monthNames: monthNames(config.locale),
		events: parseEvents(config.events),
	}
}
