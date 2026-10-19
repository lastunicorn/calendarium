import type { WeekStart } from './calendar'

export const WEEKDAY_FORMATS = ['short', 'narrow'] as const

/** How weekday names are written: `short` = "Mon", `narrow` = "M". */
export type WeekdayFormat = (typeof WEEKDAY_FORMATS)[number]

export const HOUR_FORMATS = ['auto', '12h', '24h'] as const

/** Clock for hour labels: `auto` = the locale's own, `12h` = "7:00 AM", `24h` = "07:00". */
export type HourFormat = (typeof HOUR_FORMATS)[number]

const formatters = new Map<string, Intl.DateTimeFormat>()

/**
 * A shared `Intl.DateTimeFormat` for `locale` and `options`. Building one is slow, and the day
 * layout would otherwise build two per page, so each combination is built once and reused.
 */
export function dateFormatter(
	locale: string,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale}|${JSON.stringify(options)}`
	let format = formatters.get(key)
	if (format === undefined) {
		format = new Intl.DateTimeFormat(locale, options)
		formatters.set(key, format)
	}
	return format
}

function capitalize(text: string, locale: string): string {
	return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}

/** Localized month names, January first. */
export function monthNames(locale: string): string[] {
	const format = dateFormatter(locale, { month: 'long' })
	return Array.from({ length: 12 }, (_, month) =>
		capitalize(format.format(new Date(2000, month, 1)), locale),
	)
}

/** Localized month and year heading, e.g. "January 2026", "2026年1月". */
export function monthYearName(locale: string, year: number, month: number): string {
	const format = dateFormatter(locale, { month: 'long', year: 'numeric' })
	return capitalize(format.format(new Date(year, month, 1)), locale)
}

/** Localized full weekday name of `date`, e.g. "Monday", "Luni", "月曜日". */
export function weekdayName(locale: string, date: Date): string {
	return capitalize(dateFormatter(locale, { weekday: 'long' }).format(date), locale)
}

/** Localized long date, e.g. "October 19, 2026", "19 octombrie 2026", "2026年10月19日". */
export function fullDateName(locale: string, date: Date): string {
	return capitalize(dateFormatter(locale, { dateStyle: 'long' }).format(date), locale)
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
		format.format(new Date(2000, 0, 1, first + index)),
	)
}

/** Localized weekday names, ordered from `weekStart`. */
export function weekdayNames(
	locale: string,
	weekStart: WeekStart,
	weekdayFormat: WeekdayFormat = 'short',
): string[] {
	const format = dateFormatter(locale, { weekday: weekdayFormat })
	// 2023-01-01 was a Sunday.
	return Array.from({ length: 7 }, (_, index) =>
		capitalize(
			format.format(new Date(2023, 0, 1 + weekStart + index)).replace(/\.$/, ''),
			locale,
		),
	)
}
