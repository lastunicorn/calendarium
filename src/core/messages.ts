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
	'pt-BR': { week: (n) => `Semana ${n}`, dayOfYear: (n, total) => `Dia ${n} / ${total}` },
	'nl-NL': { week: (n) => `Week ${n}`, dayOfYear: (n, total) => `Dag ${n} / ${total}` },
	'pl-PL': { week: (n) => `Tydzień ${n}`, dayOfYear: (n, total) => `Dzień ${n} / ${total}` },
	'cs-CZ': { week: (n) => `Týden ${n}`, dayOfYear: (n, total) => `Den ${n} / ${total}` },
	'sk-SK': { week: (n) => `Týždeň ${n}`, dayOfYear: (n, total) => `Deň ${n} / ${total}` },
	'hu-HU': { week: (n) => `${n}. hét`, dayOfYear: (n, total) => `${n}. nap / ${total}` },
	'hr-HR': { week: (n) => `Tjedan ${n}`, dayOfYear: (n, total) => `Dan ${n} / ${total}` },
	'bg-BG': { week: (n) => `Седмица ${n}`, dayOfYear: (n, total) => `Ден ${n} / ${total}` },
	'tr-TR': { week: (n) => `${n}. Hafta`, dayOfYear: (n, total) => `${n}. Gün / ${total}` },
	'uk-UA': { week: (n) => `Тиждень ${n}`, dayOfYear: (n, total) => `День ${n} / ${total}` },
	'ru-RU': { week: (n) => `Неделя ${n}`, dayOfYear: (n, total) => `День ${n} / ${total}` },
	'sv-SE': { week: (n) => `Vecka ${n}`, dayOfYear: (n, total) => `Dag ${n} / ${total}` },
	'da-DK': { week: (n) => `Uge ${n}`, dayOfYear: (n, total) => `Dag ${n} / ${total}` },
	'nb-NO': { week: (n) => `Uke ${n}`, dayOfYear: (n, total) => `Dag ${n} / ${total}` },
	'fi-FI': { week: (n) => `Viikko ${n}`, dayOfYear: (n, total) => `Päivä ${n} / ${total}` },
	'zh-CN': { week: (n) => `第${n}周`, dayOfYear: (n, total) => `第${n}天 / 共${total}天` },
	'ko-KR': { week: (n) => `${n}주차`, dayOfYear: (n, total) => `${n}일째 / ${total}일` },
}
