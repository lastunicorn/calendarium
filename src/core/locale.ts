import type { WeekStart } from './calendar'

/** How weekday names are written: `short` = "Mon", `narrow` = "M". */
export type WeekdayFormat = 'short' | 'narrow'

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
