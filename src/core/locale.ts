import { isWeekStart, type PlainDate, utcDate, type WeekStart } from './calendar'

/** BCP 47 tags of the languages month and weekday names, and the printed text, can be shown in. */
export const LOCALES = [
	'en-US',
	'en-GB',
	'ro-RO',
	'de-DE',
	'fr-FR',
	'es-ES',
	'it-IT',
	'ja-JP',
	'pt-BR',
	'nl-NL',
	'pl-PL',
	'cs-CZ',
	'sk-SK',
	'hu-HU',
	'hr-HR',
	'bg-BG',
	'tr-TR',
	'uk-UA',
	'ru-RU',
	'sv-SE',
	'da-DK',
	'nb-NO',
	'fi-FI',
	'zh-CN',
	'ko-KR',
	'af-ZA',
	'am-ET',
	'ca-ES',
	'et-EE',
	'fil-PH',
	'gu-IN',
	'hi-IN',
	'id-ID',
	'kn-IN',
	'lt-LT',
	'lv-LV',
	'ml-IN',
	'ms-MY',
	'sl-SI',
	'sr-RS',
	'sw-TZ',
	'ta-IN',
	'te-IN',
	'th-TH',
	'vi-VN',
	'zh-TW',
] as const
export type Locale = (typeof LOCALES)[number]

export const WEEKDAY_FORMATS = ['full', 'short', 'narrow'] as const

/** How weekday names are written: `full` = "Monday", `short` = "Mon", `narrow` = "M". */
export type WeekdayFormat = (typeof WEEKDAY_FORMATS)[number]

export const HOUR_FORMATS = ['auto', '12h', '24h'] as const

/** Clock for hour labels: `auto` = the locale's own, `12h` = "7:00 AM", `24h` = "07:00". */
export type HourFormat = (typeof HOUR_FORMATS)[number]

const formatters = new Map<string, Intl.DateTimeFormat>()

/**
 * A shared `Intl.DateTimeFormat` for `locale` and `options`. Building one is slow, and the day
 * layout would otherwise build two per page, so each combination is built once and reused.
 * It formats in UTC, like the dates `utcDate` builds, and in the Gregorian calendar, which a
 * language may not default to (Thai counts Buddhist years).
 */
export function dateFormatter(
	locale: string,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale}|${JSON.stringify(options)}`
	let format = formatters.get(key)
	if (format === undefined) {
		format = new Intl.DateTimeFormat(locale, {
			...options,
			timeZone: 'UTC',
			calendar: 'gregory',
		})
		formatters.set(key, format)
	}
	return format
}

/** `Intl.Locale`'s week data: `getWeekInfo()` in current browsers, the `weekInfo` getter in older Chromium. */
interface WeekInfoLocale {
	getWeekInfo?: () => { firstDay: number }
	weekInfo?: { firstDay: number }
}

/**
 * The day weeks start on in `locale` (Sunday in en-US, Monday in de-DE), or `undefined` when the
 * browser has no week data (Firefox).
 */
export function localeWeekStart(locale: string): WeekStart | undefined {
	const intlLocale = new Intl.Locale(locale) as Intl.Locale & WeekInfoLocale
	const firstDay = (intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo)?.firstDay
	// `firstDay` counts 1 = Monday … 7 = Sunday; `WeekStart` counts 0 = Sunday … 6 = Saturday.
	return firstDay === undefined ? undefined : ((firstDay % 7) as WeekStart)
}

/** The first day of the week as chosen: a fixed day, or `auto` for the language's own. */
export type WeekStartSetting = WeekStart | 'auto'

export function isWeekStartSetting(value: unknown): value is WeekStartSetting {
	return value === 'auto' || isWeekStart(value)
}

/**
 * The day weeks start on for `setting`: with `auto`, the language decides (Sunday in en-US,
 * Monday in en-GB), or Monday when the browser has no week data.
 */
export function resolveWeekStart(setting: WeekStartSetting, locale: string): WeekStart {
	return setting === 'auto' ? (localeWeekStart(locale) ?? 1) : setting
}

function capitalize(text: string, locale: string): string {
	return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}

/** Localized month names, January first. */
export function monthNames(locale: string): string[] {
	const format = dateFormatter(locale, { month: 'long' })
	return Array.from({ length: 12 }, (_, month) =>
		capitalize(format.format(utcDate(2000, month, 1)), locale),
	)
}

/** Localized month and year heading, e.g. "January 2026", "2026年1月". */
export function monthYearName(locale: string, year: number, month: number): string {
	const format = dateFormatter(locale, { month: 'long', year: 'numeric' })
	return capitalize(format.format(utcDate(year, month, 1)), locale)
}

/** Localized full weekday name of `date`, e.g. "Monday", "Luni", "月曜日". */
export function weekdayName(locale: string, date: PlainDate): string {
	return capitalize(dateFormatter(locale, { weekday: 'long' }).format(toDate(date)), locale)
}

/** Localized long date, e.g. "October 19, 2026", "19 octombrie 2026", "2026年10月19日". */
export function fullDateName(locale: string, date: PlainDate): string {
	return capitalize(dateFormatter(locale, { dateStyle: 'long' }).format(toDate(date)), locale)
}

/** Localized day and month, e.g. "October 19", "19 octombrie", "10月19日". */
export function dayMonthName(locale: string, date: PlainDate): string {
	const format = dateFormatter(locale, { day: 'numeric', month: 'long' })
	return capitalize(format.format(toDate(date)), locale)
}

/**
 * Localized range of long dates, sharing what the ends have in common: "October 19 – 25, 2026",
 * "29 decembrie 2025 – 4 ianuarie 2026".
 */
export function dateRangeName(locale: string, start: PlainDate, end: PlainDate): string {
	const format = dateFormatter(locale, { dateStyle: 'long' })
	return capitalize(format.formatRange(toDate(start), toDate(end)), locale)
}

function toDate(date: PlainDate): Date {
	return utcDate(date.year, date.month, date.day)
}

/**
 * Localized labels for the hours `first` to `last` inclusive. With `auto`, the locale's clock
 * decides: "7:00 AM" in en-US, "07:00" in de-DE. 24-hour labels keep two digits so they line up.
 */
export function hourNames(
	locale: string,
	first: number,
	last: number,
	hourFormat: HourFormat = 'auto',
): string[] {
	const hour12 =
		hourFormat === 'auto'
			? dateFormatter(locale, { hour: 'numeric' }).resolvedOptions().hour12
			: hourFormat === '12h'
	const format = dateFormatter(locale, {
		hour: hour12 ? 'numeric' : '2-digit',
		minute: '2-digit',
		hourCycle: hour12 ? 'h12' : 'h23',
	})
	return Array.from({ length: last - first + 1 }, (_, index) =>
		format.format(utcDate(2000, 0, 1, first + index)),
	)
}

/** Localized weekday names, ordered from `weekStart`. */
export function weekdayNames(
	locale: string,
	weekStart: WeekStart,
	weekdayFormat: WeekdayFormat = 'short',
): string[] {
	const format = dateFormatter(locale, {
		weekday: weekdayFormat === 'full' ? 'long' : weekdayFormat,
	})
	// 2023-01-01 was a Sunday.
	return Array.from({ length: 7 }, (_, index) =>
		capitalize(
			format.format(utcDate(2023, 0, 1 + weekStart + index)).replace(/\.$/, ''),
			locale,
		),
	)
}
