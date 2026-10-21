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
		const noDetails = { showHeaderWeek: false, showHeaderDayOfYear: false }
		const byWeekday = day(plan(2026, { ...noDetails, dayPageTitle: 'weekday' }), '2026-01-01')
		expect([byWeekday.heading, byWeekday.subheading]).toEqual(['Thursday', '1 January 2026'])
		const byDate = day(plan(2026, { ...noDetails, dayPageTitle: 'date' }), '2026-01-01')
		expect([byDate.heading, byDate.subheading]).toEqual(['1 January 2026', 'Thursday'])
	})

	it('sets the heading in the chosen font size', () => {
		expect(day(plan(2026), '2026-01-01').headingFontSize).toBe(24)
		expect(day(plan(2026, { headingFontSize: 36 }), '2026-01-01').headingFontSize).toBe(36)
	})

	it('details the ISO week and the day of the year after the subheading, each when asked', () => {
		const subheading = (showHeaderWeek: boolean, showHeaderDayOfYear: boolean) =>
			day(
				plan(2026, { dayPageTitle: 'weekday', showHeaderWeek, showHeaderDayOfYear }),
				'2026-02-10',
			).subheading
		// The dots have en spaces (U+2002) either side.
		expect(subheading(true, true)).toBe(
			'10 February 2026\u2002·\u2002Week 7\u2002·\u2002Day 41 / 365',
		)
		expect(subheading(true, false)).toBe('10 February 2026\u2002·\u2002Week 7')
		expect(subheading(false, true)).toBe('10 February 2026\u2002·\u2002Day 41 / 365')
		expect(subheading(false, false)).toBe('10 February 2026')
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
		const withYear = { ...defaultLayoutConfig('day-per-page').miniMonth, showYear: true }
		expect(day(plan(2026, { miniMonth: withYear }), '2026-03-17').miniMonth).toMatchObject({
			name: 'March 2026',
		})
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

		it('split the hours over two sheets, the second, without a header, taking the odd one', () => {
			const split = (lastHour: number) =>
				plan(2026, { ...hours, twoPagesPerDay: true, firstHour: 8, lastHour })[0].fills.map(
					(fill) => (fill.kind === 'hours' ? fill.hours : []),
				)
			expect(split(13)).toEqual([
				['08:00', '09:00', '10:00'],
				['11:00', '12:00', '13:00'],
			])
			expect(split(12)).toEqual([
				['08:00', '09:00'],
				['10:00', '11:00', '12:00'],
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

		it('fill the page inside its margins with 5 mm squares, on every sheet', () => {
			// A4 portrait with 12 mm margins: 186 by 273 mm, so 37 whole columns and 54 rows.
			expect(plan(2026, { dayPageLines: 'squares', twoPagesPerDay: true })[0].fills).toEqual([
				{ kind: 'squares', rows: 54, columns: 37, size: 5, align: 'center' },
				{ kind: 'squares', rows: 54, columns: 37, size: 5, align: 'center' },
			])
		})

		it('dot the corners of squares as large and as aligned as asked, on every sheet', () => {
			const fills = plan(2026, {
				dayPageLines: 'dots',
				squareSize: 4,
				squareGridAlignment: 'right',
				twoPagesPerDay: true,
			})[0].fills
			expect(fills).toEqual([
				{ kind: 'dots', size: 4, align: 'right' },
				{ kind: 'dots', size: 4, align: 'right' },
			])
		})

		it('leave every sheet blank under the header', () => {
			const [day] = plan(2026, { dayPageLines: 'blank', twoPagesPerDay: true })
			expect(day.fills).toEqual([{ kind: 'blank' }, { kind: 'blank' }])
			expect(day.heading).toBe('1 January 2026')
		})

		it('draw the squares as large as asked', () => {
			// 186 by 273 mm: 23 whole columns and 34 rows of 8 mm squares.
			expect(plan(2026, { dayPageLines: 'squares', squareSize: 8 })[0].fills).toEqual([
				{ kind: 'squares', rows: 34, columns: 23, size: 8, align: 'center' },
			])
		})

		it('set the squares across the page as aligned', () => {
			const fills = plan(2026, { dayPageLines: 'squares', squareGridAlignment: 'left' })[0]
				.fills
			expect(fills).toEqual([
				{ kind: 'squares', rows: 54, columns: 37, size: 5, align: 'left' },
			])
		})

		it('are the same for every day', () => {
			const days = plan(2026)
			expect(days[200].fills).toBe(days[0].fills)
		})
	})

	it('lists the day’s events, yearly ones every year', () => {
		const events = '0000-02-29 Leap day\n0000-12-25 Christmas\n2026-12-25 Snow'
		expect(day(plan(2026, { events }), '2026-12-25').events).toEqual(['Christmas', 'Snow'])
		expect(day(plan(2027, { events }), '2027-12-25').events).toEqual(['Christmas'])
		expect(day(plan(2024, { events }), '2024-02-29').events).toEqual(['Leap day'])
		expect(day(plan(2026), '2026-12-25').events).toEqual([])
	})
})
