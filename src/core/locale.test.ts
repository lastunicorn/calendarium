import { describe, expect, it } from 'vitest'
import { monthNames, monthYearName, weekdayNames } from './locale'

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
