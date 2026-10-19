import type { Locale } from './locale'

/** Text printed on the calendar besides `Intl`'s month, weekday and date names. */
export interface PrintMessages {
	/** The ISO week number, e.g. "Week 42". */
	week: (week: number) => string
	/** The day's position in the year, e.g. "Day 292 / 365". */
	dayOfYear: (day: number, total: number) => string
}

/**
 * The printed text in each language, so a calendar never mixes languages. As a `Record`, a new
 * locale without its messages is a compile error.
 */
export const PRINT_MESSAGES: Record<Locale, PrintMessages> = {
	'en-US': { week: (n) => `Week ${n}`, dayOfYear: (n, total) => `Day ${n} / ${total}` },
	'en-GB': { week: (n) => `Week ${n}`, dayOfYear: (n, total) => `Day ${n} / ${total}` },
	'ro-RO': { week: (n) => `Săptămâna ${n}`, dayOfYear: (n, total) => `Ziua ${n} / ${total}` },
	'de-DE': { week: (n) => `Woche ${n}`, dayOfYear: (n, total) => `Tag ${n} / ${total}` },
	'fr-FR': { week: (n) => `Semaine ${n}`, dayOfYear: (n, total) => `Jour ${n} / ${total}` },
	'es-ES': { week: (n) => `Semana ${n}`, dayOfYear: (n, total) => `Día ${n} / ${total}` },
	'it-IT': { week: (n) => `Settimana ${n}`, dayOfYear: (n, total) => `Giorno ${n} / ${total}` },
	'ja-JP': { week: (n) => `第${n}週`, dayOfYear: (n, total) => `${n}日目 / ${total}日` },
}
