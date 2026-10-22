import type { Locale } from '../../core/locale'

/** Text the week layout prints, besides `Intl`'s month, weekday and date names. */
export interface WeekPageMessages {
	/** The week's number in the heading, e.g. "Week 42". */
	week: (week: number) => string
}

/**
 * The week layout's printed text in each language, so a calendar never mixes languages. As a
 * `Record`, a new locale without its messages is a compile error.
 */
export const WEEK_PAGE_MESSAGES: Record<Locale, WeekPageMessages> = {
	'en-US': { week: (n) => `Week ${n}` },
	'en-GB': { week: (n) => `Week ${n}` },
	'ro-RO': { week: (n) => `Săptămâna ${n}` },
	'de-DE': { week: (n) => `Woche ${n}` },
	'fr-FR': { week: (n) => `Semaine ${n}` },
	'es-ES': { week: (n) => `Semana ${n}` },
	'it-IT': { week: (n) => `Settimana ${n}` },
	'ja-JP': { week: (n) => `第${n}週` },
	'pt-BR': { week: (n) => `Semana ${n}` },
	'nl-NL': { week: (n) => `Week ${n}` },
	'pl-PL': { week: (n) => `Tydzień ${n}` },
	'cs-CZ': { week: (n) => `Týden ${n}` },
	'sk-SK': { week: (n) => `Týždeň ${n}` },
	'hu-HU': { week: (n) => `${n}. hét` },
	'hr-HR': { week: (n) => `Tjedan ${n}` },
	'bg-BG': { week: (n) => `Седмица ${n}` },
	'tr-TR': { week: (n) => `${n}. Hafta` },
	'uk-UA': { week: (n) => `Тиждень ${n}` },
	'ru-RU': { week: (n) => `Неделя ${n}` },
	'sv-SE': { week: (n) => `Vecka ${n}` },
	'da-DK': { week: (n) => `Uge ${n}` },
	'nb-NO': { week: (n) => `Uke ${n}` },
	'fi-FI': { week: (n) => `Viikko ${n}` },
	'zh-CN': { week: (n) => `第${n}周` },
	'ko-KR': { week: (n) => `${n}주차` },
	'af-ZA': { week: (n) => `Week ${n}` },
	'am-ET': { week: (n) => `ሳምንት ${n}` },
	'ca-ES': { week: (n) => `Setmana ${n}` },
	'et-EE': { week: (n) => `Nädal ${n}` },
	'fil-PH': { week: (n) => `Linggo ${n}` },
	'gu-IN': { week: (n) => `અઠવાડિયું ${n}` },
	'hi-IN': { week: (n) => `सप्ताह ${n}` },
	'id-ID': { week: (n) => `Minggu ${n}` },
	'kn-IN': { week: (n) => `ವಾರ ${n}` },
	'lt-LT': { week: (n) => `Savaitė ${n}` },
	'lv-LV': { week: (n) => `${n}. nedēļa` },
	'ml-IN': { week: (n) => `ആഴ്ച ${n}` },
	'ms-MY': { week: (n) => `Minggu ${n}` },
	'sl-SI': { week: (n) => `Teden ${n}` },
	'sr-RS': { week: (n) => `Недеља ${n}` },
	'sw-TZ': { week: (n) => `Wiki ${n}` },
	'ta-IN': { week: (n) => `வாரம் ${n}` },
	'te-IN': { week: (n) => `వారం ${n}` },
	'th-TH': { week: (n) => `สัปดาห์ที่ ${n}` },
	'vi-VN': { week: (n) => `Tuần ${n}` },
	'zh-TW': { week: (n) => `第${n}週` },
}
