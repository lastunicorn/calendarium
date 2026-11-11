import type { Locale } from '../../core/locale'

/** Text the day layout prints, besides `Intl`'s month, weekday and date names. */
export interface DayPageMessages {
	/** The day's ISO week in the details line, e.g. "Week 42". */
	week: (week: number) => string
	/** The day's position in the year, e.g. "Day 292 / 365". */
	dayOfYear: (day: number, total: number) => string
}

/**
 * The day layout's printed text in each language, so a calendar never mixes languages. As a
 * `Record`, a new locale without its messages is a compile error.
 */
export const DAY_PAGE_MESSAGES: Record<Locale, DayPageMessages> = {
	'en-US': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Day ${n} / ${total}`,
	},
	'en-GB': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Day ${n} / ${total}`,
	},
	'ro-RO': {
		week: (n) => `Săptămâna ${n}`,
		dayOfYear: (n, total) => `Ziua ${n} / ${total}`,
	},
	'de-DE': {
		week: (n) => `Woche ${n}`,
		dayOfYear: (n, total) => `Tag ${n} / ${total}`,
	},
	'fr-FR': {
		week: (n) => `Semaine ${n}`,
		dayOfYear: (n, total) => `Jour ${n} / ${total}`,
	},
	'es-ES': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Día ${n} / ${total}`,
	},
	'it-IT': {
		week: (n) => `Settimana ${n}`,
		dayOfYear: (n, total) => `Giorno ${n} / ${total}`,
	},
	'ja-JP': {
		week: (n) => `第${n}週`,
		dayOfYear: (n, total) => `${n}日目 / ${total}日`,
	},
	'pt-BR': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Dia ${n} / ${total}`,
	},
	'nl-NL': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
	},
	'pl-PL': {
		week: (n) => `Tydzień ${n}`,
		dayOfYear: (n, total) => `Dzień ${n} / ${total}`,
	},
	'cs-CZ': {
		week: (n) => `Týden ${n}`,
		dayOfYear: (n, total) => `Den ${n} / ${total}`,
	},
	'sk-SK': {
		week: (n) => `Týždeň ${n}`,
		dayOfYear: (n, total) => `Deň ${n} / ${total}`,
	},
	'hu-HU': {
		week: (n) => `${n}. hét`,
		dayOfYear: (n, total) => `${n}. nap / ${total}`,
	},
	'hr-HR': {
		week: (n) => `Tjedan ${n}`,
		dayOfYear: (n, total) => `Dan ${n} / ${total}`,
	},
	'bg-BG': {
		week: (n) => `Седмица ${n}`,
		dayOfYear: (n, total) => `Ден ${n} / ${total}`,
	},
	'tr-TR': {
		week: (n) => `${n}. Hafta`,
		dayOfYear: (n, total) => `${n}. Gün / ${total}`,
	},
	'uk-UA': {
		week: (n) => `Тиждень ${n}`,
		dayOfYear: (n, total) => `День ${n} / ${total}`,
	},
	'ru-RU': {
		week: (n) => `Неделя ${n}`,
		dayOfYear: (n, total) => `День ${n} / ${total}`,
	},
	'sv-SE': {
		week: (n) => `Vecka ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
	},
	'da-DK': {
		week: (n) => `Uge ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
	},
	'nb-NO': {
		week: (n) => `Uke ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
	},
	'fi-FI': {
		week: (n) => `Viikko ${n}`,
		dayOfYear: (n, total) => `Päivä ${n} / ${total}`,
	},
	'zh-CN': {
		week: (n) => `第${n}周`,
		dayOfYear: (n, total) => `第${n}天 / 共${total}天`,
	},
	'ko-KR': {
		week: (n) => `${n}주차`,
		dayOfYear: (n, total) => `${n}일째 / ${total}일`,
	},
	'af-ZA': {
		week: (n) => `Week ${n}`,
		dayOfYear: (n, total) => `Dag ${n} / ${total}`,
	},
	'am-ET': {
		week: (n) => `ሳምንት ${n}`,
		dayOfYear: (n, total) => `ቀን ${n} / ${total}`,
	},
	'ca-ES': {
		week: (n) => `Setmana ${n}`,
		dayOfYear: (n, total) => `Dia ${n} / ${total}`,
	},
	'et-EE': {
		week: (n) => `Nädal ${n}`,
		dayOfYear: (n, total) => `Päev ${n} / ${total}`,
	},
	'fil-PH': {
		week: (n) => `Linggo ${n}`,
		dayOfYear: (n, total) => `Araw ${n} / ${total}`,
	},
	'gu-IN': {
		week: (n) => `અઠવાડિયું ${n}`,
		dayOfYear: (n, total) => `દિવસ ${n} / ${total}`,
	},
	'hi-IN': {
		week: (n) => `सप्ताह ${n}`,
		dayOfYear: (n, total) => `दिन ${n} / ${total}`,
	},
	'id-ID': {
		week: (n) => `Minggu ${n}`,
		dayOfYear: (n, total) => `Hari ${n} / ${total}`,
	},
	'kn-IN': {
		week: (n) => `ವಾರ ${n}`,
		dayOfYear: (n, total) => `ದಿನ ${n} / ${total}`,
	},
	'lt-LT': {
		week: (n) => `Savaitė ${n}`,
		dayOfYear: (n, total) => `Diena ${n} / ${total}`,
	},
	'lv-LV': {
		week: (n) => `${n}. nedēļa`,
		dayOfYear: (n, total) => `${n}. diena / ${total}`,
	},
	'ml-IN': {
		week: (n) => `ആഴ്ച ${n}`,
		dayOfYear: (n, total) => `ദിവസം ${n} / ${total}`,
	},
	'ms-MY': {
		week: (n) => `Minggu ${n}`,
		dayOfYear: (n, total) => `Hari ${n} / ${total}`,
	},
	'sl-SI': {
		week: (n) => `Teden ${n}`,
		dayOfYear: (n, total) => `Dan ${n} / ${total}`,
	},
	'sr-RS': {
		week: (n) => `Недеља ${n}`,
		dayOfYear: (n, total) => `Дан ${n} / ${total}`,
	},
	'sw-TZ': {
		week: (n) => `Wiki ${n}`,
		dayOfYear: (n, total) => `Siku ${n} / ${total}`,
	},
	'ta-IN': {
		week: (n) => `வாரம் ${n}`,
		dayOfYear: (n, total) => `நாள் ${n} / ${total}`,
	},
	'te-IN': {
		week: (n) => `వారం ${n}`,
		dayOfYear: (n, total) => `రోజు ${n} / ${total}`,
	},
	'th-TH': {
		week: (n) => `สัปดาห์ที่ ${n}`,
		dayOfYear: (n, total) => `วันที่ ${n} / ${total}`,
	},
	'vi-VN': {
		week: (n) => `Tuần ${n}`,
		dayOfYear: (n, total) => `Ngày ${n} / ${total}`,
	},
	'zh-TW': {
		week: (n) => `第${n}週`,
		dayOfYear: (n, total) => `第${n}天 / 共${total}天`,
	},
	'el-GR': {
		week: (n) => `Εβδομάδα ${n}`,
		dayOfYear: (n, total) => `Ημέρα ${n} / ${total}`,
	},
	'pt-PT': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Dia ${n} / ${total}`,
	},
	'es-MX': {
		week: (n) => `Semana ${n}`,
		dayOfYear: (n, total) => `Día ${n} / ${total}`,
	},
	'fr-CA': {
		week: (n) => `Semaine ${n}`,
		dayOfYear: (n, total) => `Jour ${n} / ${total}`,
	},
	'de-AT': {
		week: (n) => `Woche ${n}`,
		dayOfYear: (n, total) => `Tag ${n} / ${total}`,
	},
	'de-CH': {
		week: (n) => `Woche ${n}`,
		dayOfYear: (n, total) => `Tag ${n} / ${total}`,
	},
	'zh-HK': {
		week: (n) => `第${n}週`,
		dayOfYear: (n, total) => `第${n}天 / 共${total}天`,
	},
}
