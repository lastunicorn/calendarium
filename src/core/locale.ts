import type { WeekStart } from './calendar'

export const WEEKDAY_FORMATS = ['short', 'narrow'] as const

/** How weekday names are written: `short` = "Mon", `narrow` = "M". */
export type WeekdayFormat = (typeof WEEKDAY_FORMATS)[number]

function capitalize(text: string, locale: string): string {
	return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}

/** Localized month names, January first. */
export function monthNames(locale: string): string[] {
	const format = new Intl.DateTimeFormat(locale, { month: 'long' })
	return Array.from({ length: 12 }, (_, month) =>
		capitalize(format.format(new Date(2000, month, 1)), locale),
	)
}

/** Localized month and year heading, e.g. "January 2026", "2026年1月". */
export function monthYearName(locale: string, year: number, month: number): string {
	const format = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
	return capitalize(format.format(new Date(year, month, 1)), locale)
}

/** Localized full weekday name of `date`, e.g. "Monday", "Luni", "月曜日". */
export function weekdayName(locale: string, date: Date): string {
	return capitalize(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date), locale)
}

/** Localized long date, e.g. "October 19, 2026", "19 octombrie 2026", "2026年10月19日". */
export function fullDateName(locale: string, date: Date): string {
	return capitalize(new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date), locale)
}

/** Localized weekday names, ordered from `weekStart`. */
export function weekdayNames(
	locale: string,
	weekStart: WeekStart,
	weekdayFormat: WeekdayFormat = 'short',
): string[] {
	const format = new Intl.DateTimeFormat(locale, { weekday: weekdayFormat })
	// 2023-01-01 was a Sunday.
	return Array.from({ length: 7 }, (_, index) =>
		capitalize(
			format.format(new Date(2023, 0, 1 + weekStart + index)).replace(/\.$/, ''),
			locale,
		),
	)
}
