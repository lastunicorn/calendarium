import { describe, expect, it } from 'vitest'
import { calendarModel } from '../common'
import { defaultLayoutConfig } from '../index'
import type { DayPerPageConfig } from './options'
import { type DayPages, planDayPages } from './pages'

/** The plan of the default day layout for `year`, in British English with Monday weeks, changed by `options`. */
function plan(year: number, options: Partial<DayPerPageConfig> = {}): DayPages[] {
	const config: DayPerPageConfig = {
		...defaultLayoutConfig('day-per-page'),
		year,
		locale: 'en-GB',
		weekStart: 1,
		...options,
	}
	return planDayPages(config, calendarModel(config))
}

/** The day keyed `key`. */
function day(days: DayPages[], key: string): DayPages {
	return days.find((candidate) => candidate.day.key === key)!
}

describe('planDayPages', () => {
	it('plans every day of the year, February 29 in a leap year', () => {
		expect(plan(2025)).toHaveLength(365)
		const leap = plan(2024)
		expect(leap).toHaveLength(366)
		expect(leap[59].day.key).toBe('2024-02-29')
	})

	it('heads a day with its weekday or its date, the other one below', () => {
		const byWeekday = day(plan(2026), '2026-01-01')
		expect([byWeekday.heading, byWeekday.subheading]).toEqual(['Thursday', '1 January 2026'])
		const byDate = day(plan(2026, { dayPageTitle: 'date' }), '2026-01-01')
		expect([byDate.heading, byDate.subheading]).toEqual(['1 January 2026', 'Thursday'])
	})

	it('details the ISO week and the day of the year, each when asked', () => {
		const details = (showHeaderWeek: boolean, showHeaderDayOfYear: boolean) =>
			day(plan(2026, { showHeaderWeek, showHeaderDayOfYear }), '2026-02-10').details
		expect(details(true, true)).toBe('Week 7 · Day 41 / 365')
		expect(details(true, false)).toBe('Week 7')
		expect(details(false, true)).toBe('Day 41 / 365')
		expect(details(false, false)).toBe('')
	})

	it('heads a weekend day in the weekend color, when asked', () => {
		expect(day(plan(2026), '2026-01-03').weekend).toBe(true)
		expect(day(plan(2026), '2026-01-02').weekend).toBe(false)
		expect(day(plan(2026, { highlightWeekendDays: false }), '2026-01-03').weekend).toBe(false)
	})

	it('shows the day’s month with the day marked, when asked', () => {
		const shown = day(plan(2026), '2026-03-17')
		expect(shown.miniMonth).toMatchObject({ name: 'March', markedDay: 17 })
		expect(shown.miniMonth!.month.month).toBe(2)
		const hidden = { ...defaultLayoutConfig('day-per-page').miniMonth, show: false }
		expect(day(plan(2026, { miniMonth: hidden }), '2026-03-17').miniMonth).toBeUndefined()
	})

	describe('fills', () => {
		const hours = { dayPageLines: 'hours', hourFormat: '24h' } as const

		it('fill one sheet with the schedule’s hours', () => {
			expect(plan(2026, { ...hours, firstHour: 8, lastHour: 10 })[0].fills).toEqual([
				{ kind: 'hours', hours: ['08:00', '09:00', '10:00'] },
			])
		})

		it('split the hours over two sheets, the first taking the odd one', () => {
			const split = (lastHour: number) =>
				plan(2026, { ...hours, twoPagesPerDay: true, firstHour: 8, lastHour })[0].fills.map(
					(fill) => (fill.kind === 'hours' ? fill.hours : []),
				)
			expect(split(13)).toEqual([
				['08:00', '09:00', '10:00'],
				['11:00', '12:00', '13:00'],
			])
			expect(split(12)).toEqual([
				['08:00', '09:00', '10:00'],
				['11:00', '12:00'],
			])
		})

		it('rule as many 8 mm lines as fill the page inside its margins, on every sheet', () => {
			// A4 portrait with 12 mm margins: 273 mm high, so 35 lines; A5 landscape: 124 mm, 16.
			expect(plan(2026, { dayPageLines: 'ruled' })[0].fills).toEqual([
				{ kind: 'ruled', lines: 35, spacing: 8 },
			])
			const a5 = { ...defaultLayoutConfig('day-per-page').page }
			Object.assign(a5, { paperSize: 'a5', orientation: 'landscape' })
			const fills = plan(2026, { dayPageLines: 'ruled', twoPagesPerDay: true, page: a5 })[0]
				.fills
			expect(fills).toEqual([
				{ kind: 'ruled', lines: 16, spacing: 8 },
				{ kind: 'ruled', lines: 16, spacing: 8 },
			])
		})

		it('rule the lines as far apart as asked', () => {
			// 273 mm high: 46 lines 6 mm apart, the last one clipped.
			expect(plan(2026, { dayPageLines: 'ruled', ruledLineSpacing: 6 })[0].fills).toEqual([
				{ kind: 'ruled', lines: 46, spacing: 6 },
			])
		})

		it('are the same for every day', () => {
			const days = plan(2026)
			expect(days[200].fills).toBe(days[0].fills)
		})
	})
})
