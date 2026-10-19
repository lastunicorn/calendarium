import { describe, expect, it } from 'vitest'
import {
	dateFormatter,
	fullDateName,
	hourNames,
	LOCALES,
	localeWeekStart,
	monthNames,
	monthYearName,
	weekdayName,
	weekdayNames,
} from './locale'

describe('dateFormatter', () => {
	it('reuses one formatter per locale and options', () => {
		const format = dateFormatter('de-DE', { month: 'long' })
		expect(dateFormatter('de-DE', { month: 'long' })).toBe(format)
		expect(dateFormatter('de-DE', { month: 'short' })).not.toBe(format)
		expect(dateFormatter('fr-FR', { month: 'long' })).not.toBe(format)
	})
})

describe('monthNames', () => {
	it('returns 12 capitalized names', () => {
		expect(monthNames('en-US')[0]).toBe('January')
		expect(monthNames('en-US')[11]).toBe('December')
		expect(monthNames('ro-RO')[0]).toBe('Ianuarie')
	})

	it('writes Japanese month names', () => {
		expect(monthNames('ja-JP')[0]).toBe('1月')
		expect(monthNames('ja-JP')[11]).toBe('12月')
	})
})

describe('monthYearName', () => {
	it('writes the month and year in the locale, capitalized', () => {
		expect(monthYearName('en-US', 2026, 0)).toBe('January 2026')
		expect(monthYearName('ro-RO', 2026, 0)).toBe('Ianuarie 2026')
		expect(monthYearName('ja-JP', 2026, 11)).toBe('2026年12月')
	})
})

describe('weekdayNames', () => {
	it('starts on the given week start day', () => {
		expect(weekdayNames('en-US', 1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
		expect(weekdayNames('en-US', 0)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
		expect(weekdayNames('en-US', 6)).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
	})

	it('writes one-letter names in the narrow format', () => {
		expect(weekdayNames('en-US', 1, 'narrow')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
		expect(weekdayNames('ro-RO', 1, 'narrow')).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D'])
	})

	it('strips abbreviation dots', () => {
		expect(weekdayNames('ro-RO', 1)[0]).toBe('Lun')
	})

	it('writes Japanese weekday names', () => {
		expect(weekdayNames('ja-JP', 0)).toEqual(['日', '月', '火', '水', '木', '金', '土'])
	})
})

describe('weekdayName', () => {
	it('writes the full weekday name in the locale, capitalized', () => {
		const date = new Date(2026, 9, 19)
		expect(weekdayName('en-US', date)).toBe('Monday')
		expect(weekdayName('ro-RO', date)).toBe('Luni')
		expect(weekdayName('ja-JP', date)).toBe('月曜日')
	})
})

describe('fullDateName', () => {
	it('writes the long date in the locale', () => {
		const date = new Date(2026, 9, 19)
		expect(fullDateName('en-US', date)).toBe('October 19, 2026')
		expect(fullDateName('ro-RO', date)).toBe('19 octombrie 2026')
		expect(fullDateName('ja-JP', date)).toBe('2026年10月19日')
	})
})

describe('hourNames', () => {
	it('lists every hour of the range, in the locale’s clock', () => {
		expect(hourNames('de-DE', 7, 21)).toHaveLength(15)
		expect(hourNames('de-DE', 7, 9)).toEqual(['07:00', '08:00', '09:00'])
		expect(hourNames('ro-RO', 20, 21)).toEqual(['20:00', '21:00'])
		expect(hourNames('ja-JP', 7, 8)).toEqual(['07:00', '08:00'])
		expect(hourNames('en-US', 11, 13).map((name) => name.replace(/\s/g, ' '))).toEqual([
			'11:00 AM',
			'12:00 PM',
			'1:00 PM',
		])
	})

	it('uses the requested clock over the locale’s', () => {
		const plain = (names: string[]) => names.map((name) => name.replace(/\s/g, ' '))
		expect(hourNames('en-US', 0, 1, '24h')).toEqual(['00:00', '01:00'])
		expect(hourNames('en-US', 20, 21, '24h')).toEqual(['20:00', '21:00'])
		expect(plain(hourNames('de-DE', 0, 1, '12h'))).toEqual(['12:00 AM', '1:00 AM'])
		expect(plain(hourNames('en-US', 11, 13, '12h'))).toEqual([
			'11:00 AM',
			'12:00 PM',
			'1:00 PM',
		])
		expect(hourNames('de-DE', 7, 8, 'auto')).toEqual(['07:00', '08:00'])
	})
})

describe('localeWeekStart', () => {
	it('gives each language its own first day of the week', () => {
		expect(localeWeekStart('en-US')).toBe(0) // Sunday
		expect(localeWeekStart('en-GB')).toBe(1) // Monday
		expect(localeWeekStart('de-DE')).toBe(1)
	})

	it('knows the first day of every supported language', () => {
		for (const locale of LOCALES) expect(localeWeekStart(locale)).toBeTypeOf('number')
	})
})
