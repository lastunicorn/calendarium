import type { Locale } from './locale'

/** Text printed on the calendar besides `Intl`'s month, weekday and date names. */
export interface PrintMessages {
	/** The ISO week number, e.g. "Week 42". */
	week: (week: number) => string
	/** The day's position in the year, e.g. "Day 292 / 365". */
	dayOfYear: (day: number, total: number) => string
	/** The heading of the year's list of events. */
	events: string
}

/**
 * The printed text in each language, so a calendar never mixes languages. As a `Record`, a new
 * locale without its messages is a compile error.
 */
export const PRINT_MESSAGES: Record<Locale, PrintMessages> = {
	'en-US': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Day ${n} / ${total}`,
		events: 'Events',
	},
	'en-GB': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Day ${n} / ${total}`,
		events: 'Events',
	},
	'ro-RO': {
		week: (n) => `Săptămâna ${n}`,
		dayOfYear: (n, total) => `Ziua ${n} / ${total}`,
		events: 'Evenimente',
	},
	'de-DE': {
		week: (n) => `Woche ${n}`,
		dayOfYear: (n, total) => `Tag ${n} / ${total}`,
		events: 'Termine',
	},
	'fr-FR': {
		week: (n) => `Semaine ${n}`,
		dayOfYear: (n, total) => `Jour ${n} / ${total}`,
		events: 'Événements',
	},
	'es-ES': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Día ${n} / ${total}`,
		events: 'Eventos',
	},
	'it-IT': {
		week: (n) => `Settimana ${n}`,
		dayOfYear: (n, total) => `Giorno ${n} / ${total}`,
		events: 'Eventi',
	},
	'ja-JP': {
		week: (n) => `第${n}週`,
		dayOfYear: (n, total) => `${n}日目 / ${total}日`,
		events: '予定',
	},
	'pt-BR': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Dia ${n} / ${total}`,
		events: 'Eventos',
	},
	'nl-NL': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
		events: 'Evenementen',
	},
	'pl-PL': {
		week: (n) => `Tydzień ${n}`,
		dayOfYear: (n, total) => `Dzień ${n} / ${total}`,
		events: 'Wydarzenia',
	},
	'cs-CZ': {
		week: (n) => `Týden ${n}`,
		dayOfYear: (n, total) => `Den ${n} / ${total}`,
		events: 'Události',
	},
	'sk-SK': {
		week: (n) => `Týždeň ${n}`,
		dayOfYear: (n, total) => `Deň ${n} / ${total}`,
		events: 'Udalosti',
	},
	'hu-HU': {
		week: (n) => `${n}. hét`,
		dayOfYear: (n, total) => `${n}. nap / ${total}`,
		events: 'Események',
	},
	'hr-HR': {
		week: (n) => `Tjedan ${n}`,
		dayOfYear: (n, total) => `Dan ${n} / ${total}`,
		events: 'Događaji',
	},
	'bg-BG': {
		week: (n) => `Седмица ${n}`,
		dayOfYear: (n, total) => `Ден ${n} / ${total}`,
		events: 'Събития',
	},
	'tr-TR': {
		week: (n) => `${n}. Hafta`,
		dayOfYear: (n, total) => `${n}. Gün / ${total}`,
		events: 'Etkinlikler',
	},
	'uk-UA': {
		week: (n) => `Тиждень ${n}`,
		dayOfYear: (n, total) => `День ${n} / ${total}`,
		events: 'Події',
	},
	'ru-RU': {
		week: (n) => `Неделя ${n}`,
		dayOfYear: (n, total) => `День ${n} / ${total}`,
		events: 'События',
	},
	'sv-SE': {
		week: (n) => `Vecka ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
		events: 'Händelser',
	},
	'da-DK': {
		week: (n) => `Uge ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
		events: 'Begivenheder',
	},
	'nb-NO': {
		week: (n) => `Uke ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
		events: 'Hendelser',
	},
	'fi-FI': {
		week: (n) => `Viikko ${n}`,
		dayOfYear: (n, total) => `Päivä ${n} / ${total}`,
		events: 'Tapahtumat',
	},
	'zh-CN': {
		week: (n) => `第${n}周`,
		dayOfYear: (n, total) => `第${n}天 / 共${total}天`,
		events: '活动',
	},
	'ko-KR': {
		week: (n) => `${n}주차`,
		dayOfYear: (n, total) => `${n}일째 / ${total}일`,
		events: '일정',
	},
}
