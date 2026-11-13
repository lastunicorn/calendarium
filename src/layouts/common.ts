import { buildYear, isYear, type CalendarMonth, type WeekStart } from '../core/calendar'
import { parseEvents, type CalendarEvent } from '../core/events'
import {
	isWeekStartSetting,
	LOCALES,
	monthNames,
	resolveWeekStart,
	type Locale,
	type WeekStartSetting,
} from '../core/locale'
import { margins, normalizePage, PAGE_VALIDATORS, type PageSetup } from '../core/paper'
import { isStringArray, oneOf, type Validators } from '../core/validation'

/** Which calendar is printed: the year, in which language, and the day its weeks start on. */
export interface CalendarOptions {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	/** A fixed first day of the week, or `auto` for the language's own. */
	weekStart: WeekStartSetting
}

/** Options every layout has, each with the same meaning in all of them. */
export interface CommonOptions {
	calendar: CalendarOptions
	/**
	 * Named days, one per line: `YYYY-MM-DD` and the name, the year `0000` for every year
	 * (`parseEvents`). Kept as typed, invalid lines too, so editing never loses text.
	 */
	events: string[]
	page: PageSetup
}

/**
 * The browser's language when the calendar has it, so a German browser starts in German.
 * English, of any region, and unsupported languages start in British English.
 */
function defaultLocale(): Locale {
	const tag = globalThis.navigator?.language
	if (tag === undefined) return 'en-GB'
	const { language, region } = new Intl.Locale(tag)
	if (language === 'en') return 'en-GB'
	const sameLanguage = LOCALES.filter((locale) => new Intl.Locale(locale).language === language)
	return (
		sameLanguage.find((locale) => new Intl.Locale(locale).region === region) ??
		sameLanguage[0] ??
		'en-GB'
	)
}

/** The options shared by every layout, with the values all layouts start from. */
export function commonDefaults(): CommonOptions {
	return {
		calendar: { year: new Date().getFullYear(), locale: defaultLocale(), weekStart: 'auto' },
		events: [],
		page: {
			paperSize: 'a4',
			orientation: 'portrait',
			margins: margins(12),
			equalMargins: true,
			mirrorMargins: false,
			spine: 'left',
			booklet: false,
		},
	}
}

/** The validators of the options every layout has; each layout's spec extends them. */
export const COMMON_VALIDATORS: Validators<CommonOptions> = {
	calendar: { year: isYear, locale: oneOf(LOCALES), weekStart: isWeekStartSetting },
	events: isStringArray,
	page: PAGE_VALIDATORS,
}

/**
 * `options` with the rules of the options every layout has applied (`normalizePage`); each
 * layout's `normalize` starts from it. The same object when it already follows them.
 */
export function normalizeCommon<O extends CommonOptions>(options: O): O {
	const page = normalizePage(options.page)
	return page === options.page ? options : { ...options, page }
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
export function calendarModel(options: CommonOptions): CalendarModel {
	const { year, locale } = options.calendar
	const weekStart = resolveWeekStart(options.calendar.weekStart, locale)
	return {
		weekStart,
		months: buildYear(year, weekStart),
		monthNames: monthNames(locale),
		events: parseEvents(options.events),
	}
}
