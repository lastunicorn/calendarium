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
	'af-ZA': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
		events: 'Gebeure',
	},
	'am-ET': {
		week: (n) => `ሳምንት ${n}`,
		dayOfYear: (n, total) => `ቀን ${n} / ${total}`,
		events: 'ክስተቶች',
	},
	'ca-ES': {
		week: (n) => `Setmana ${n}`,
		dayOfYear: (n, total) => `Dia ${n} / ${total}`,
		events: 'Esdeveniments',
	},
	'et-EE': {
		week: (n) => `Nädal ${n}`,
		dayOfYear: (n, total) => `Päev ${n} / ${total}`,
		events: 'Sündmused',
	},
	'fil-PH': {
		week: (n) => `Linggo ${n}`,
		dayOfYear: (n, total) => `Araw ${n} / ${total}`,
		events: 'Mga kaganapan',
	},
	'gu-IN': {
		week: (n) => `અઠવાડિયું ${n}`,
		dayOfYear: (n, total) => `દિવસ ${n} / ${total}`,
		events: 'પ્રસંગો',
	},
	'hi-IN': {
		week: (n) => `सप्ताह ${n}`,
		dayOfYear: (n, total) => `दिन ${n} / ${total}`,
		events: 'कार्यक्रम',
	},
	'id-ID': {
		week: (n) => `Minggu ${n}`,
		dayOfYear: (n, total) => `Hari ${n} / ${total}`,
		events: 'Acara',
	},
	'kn-IN': {
		week: (n) => `ವಾರ ${n}`,
		dayOfYear: (n, total) => `ದಿನ ${n} / ${total}`,
		events: 'ಕಾರ್ಯಕ್ರಮಗಳು',
	},
	'lt-LT': {
		week: (n) => `Savaitė ${n}`,
		dayOfYear: (n, total) => `Diena ${n} / ${total}`,
		events: 'Įvykiai',
	},
	'lv-LV': {
		week: (n) => `${n}. nedēļa`,
		dayOfYear: (n, total) => `${n}. diena / ${total}`,
		events: 'Notikumi',
	},
	'ml-IN': {
		week: (n) => `ആഴ്ച ${n}`,
		dayOfYear: (n, total) => `ദിവസം ${n} / ${total}`,
		events: 'പരിപാടികൾ',
	},
	'ms-MY': {
		week: (n) => `Minggu ${n}`,
		dayOfYear: (n, total) => `Hari ${n} / ${total}`,
		events: 'Acara',
	},
	'sl-SI': {
		week: (n) => `Teden ${n}`,
		dayOfYear: (n, total) => `Dan ${n} / ${total}`,
		events: 'Dogodki',
	},
	'sr-RS': {
		week: (n) => `Недеља ${n}`,
		dayOfYear: (n, total) => `Дан ${n} / ${total}`,
		events: 'Догађаји',
	},
	'sw-TZ': {
		week: (n) => `Wiki ${n}`,
		dayOfYear: (n, total) => `Siku ${n} / ${total}`,
		events: 'Matukio',
	},
	'ta-IN': {
		week: (n) => `வாரம் ${n}`,
		dayOfYear: (n, total) => `நாள் ${n} / ${total}`,
		events: 'நிகழ்வுகள்',
	},
	'te-IN': {
		week: (n) => `వారం ${n}`,
		dayOfYear: (n, total) => `రోజు ${n} / ${total}`,
		events: 'కార్యక్రమాలు',
	},
	'th-TH': {
		week: (n) => `สัปดาห์ที่ ${n}`,
		dayOfYear: (n, total) => `วันที่ ${n} / ${total}`,
		events: 'กิจกรรม',
	},
	'vi-VN': {
		week: (n) => `Tuần ${n}`,
		dayOfYear: (n, total) => `Ngày ${n} / ${total}`,
		events: 'Sự kiện',
	},
	'zh-TW': {
		week: (n) => `第${n}週`,
		dayOfYear: (n, total) => `第${n}天 / 共${total}天`,
		events: '活動',
	},
}
