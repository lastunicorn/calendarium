import { describe, expect, it } from 'vitest'
import { calendarModel } from '../common'
import { defaultLayoutConfig } from '../index'
import type { WeekPerPageConfig } from './options'
import { planWeekPages, type WeekPageDay, type WeekPages } from './pages'

/** The plan of the default week layout for `year`, in British English with Monday weeks, changed by `options`. */
function plan(year: number, options: Partial<WeekPerPageConfig> = {}) {
	const config: WeekPerPageConfig = {
		...defaultLayoutConfig('week-per-page'),
		year,
		locale: 'en-GB',
		weekStart: 1,
		...options,
	}
	return planWeekPages(config, calendarModel(config))
}

/** The week starting on the day keyed `key`. */
function week(weeks: WeekPages[], key: string): WeekPages {
	return weeks.find((candidate) => candidate.key === key)!
}

/** Every day of `week`'s sheets, in order. */
function days(week: WeekPages): WeekPageDay[] {
	return week.sheets.flatMap((sheet) => sheet.cells.flat())
}

/** Each sheet of `week` as the weekdays of its cells, 0 = Sunday. */
function sheetWeekdays(week: WeekPages): number[][][] {
	return week.sheets.map((sheet) => sheet.cells.map((cell) => cell.map((day) => day.day.weekday)))
}

describe('planWeekPages', () => {
	it('plans every week holding a day of the year', () => {
		// Monday weeks: 2025 runs from Dec 30, 2024 to Jan 4, 2026.
		const { weeks } = plan(2025)
		expect(weeks).toHaveLength(53)
		expect(weeks[0].key).toBe('2024-12-30')
		expect(days(weeks[52]).at(-1)!.day.key).toBe('2026-01-04')
	})

	it('plans 54 weeks when a leap year starts on the last day of a week', () => {
		// 2028 starts on a Saturday: Sunday weeks run from Dec 26, 2027 to Jan 6, 2029.
		expect(plan(2028, { weekStart: 0 }).weeks).toHaveLength(54)
	})

	it('skips a week whose only days of the year are a hidden weekend', () => {
		// 2022 starts on a Saturday: its first Monday week holds only January 1 and 2.
		expect(plan(2022).weeks).toHaveLength(53)
		const { weeks } = plan(2022, { weekendDisplay: 'hidden' })
		expect(weeks).toHaveLength(52)
		expect(weeks[0].key).toBe('2022-01-03')
	})

	it('heads a week with its dates and, when asked, its ISO week', () => {
		const shown = week(plan(2026).weeks, '2026-10-19')
		expect(shown.heading).toContain('October 2026')
		expect(shown.subheading).toBe('Week 43')
		expect(week(plan(2026, { showHeaderWeek: false }).weeks, '2026-10-19').subheading).toBe('')
	})

	it('sets the heading left beside the mini month or over two pages, unless told where', () => {
		const align = (options: Partial<WeekPerPageConfig>) =>
			week(plan(2026, options).weeks, '2026-10-19').headingAlign
		const miniMonth = { ...defaultLayoutConfig('week-per-page').miniMonth, show: false }
		expect(align({ miniMonth })).toBe('center')
		expect(align({})).toBe('left')
		expect(align({ twoPagesPerWeek: true, miniMonth })).toBe('left')
		expect(align({ headingAlignment: 'right' })).toBe('right')
		expect(align({ headingAlignment: 'center', twoPagesPerWeek: true, miniMonth })).toBe(
			'center',
		)
	})

	it('puts the whole week on one sheet, or Monday to Wednesday then the rest on two', () => {
		const one = week(plan(2026, { weekendDisplay: 'full' }).weeks, '2026-10-19')
		expect(one.sheets.map((sheet) => sheet.header)).toEqual(['both'])
		const two = week(
			plan(2026, { weekendDisplay: 'full', twoPagesPerWeek: true }).weeks,
			'2026-10-19',
		)
		expect(two.sheets.map((sheet) => sheet.header)).toEqual(['heading', 'miniMonth'])
		expect(sheetWeekdays(two)).toEqual([
			[[1], [2], [3]],
			[[4], [5], [6], [0]],
		])
	})

	it('names the month where it changes and on each sheet’s first day', () => {
		// January 26 – February 1, 2026.
		const monthNames = (options: Partial<WeekPerPageConfig>) =>
			week(plan(2026, { weekendDisplay: 'full', ...options }).weeks, '2026-01-26').sheets.map(
				(sheet) => sheet.cells.flat().map((day) => day.monthName ?? ''),
			)
		expect(monthNames({})).toEqual([['January', '', '', '', '', '', 'February']])
		expect(monthNames({ twoPagesPerWeek: true })).toEqual([
			['January', '', ''],
			['January', '', '', 'February'],
		])
	})

	it('labels each day with its weekday from the week start, in the chosen format', () => {
		const saturdays = plan(2026, { weekStart: 6, weekendDisplay: 'full' }).weeks[1]
		expect(days(saturdays).map((day) => day.weekday)).toEqual([
			'Sat',
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
		])
		const narrow = plan(2026, { weekdayFormat: 'narrow' }).weeks[1]
		expect(days(narrow)[0].weekday).toBe('M')
		const full = plan(2026, { weekdayFormat: 'full' }).weeks[1]
		expect(days(full)[0].weekday).toBe('Monday')
	})

	it('gives a schedule to each day of the year in a cell of its own', () => {
		const scheduled = (options: Partial<WeekPerPageConfig>) =>
			plan(2025, { weekPageLines: 'hours', ...options })
				.weeks.flatMap(days)
				.filter((day) => day.schedule).length
		// One per day of 2025, none for the days of 2024 and 2026 on the first and last week.
		expect(scheduled({ weekendDisplay: 'full' })).toBe(365)
		// Its 104 weekend days share cells.
		expect(scheduled({ weekendDisplay: 'reduced' })).toBe(261)
		// A week starting on Sunday can't reduce its weekend, so its cells keep the schedule.
		expect(scheduled({ weekendDisplay: 'reduced', weekStart: 0 })).toBe(365)
	})

	it('labels the schedule’s hours once, only when the cells hold it', () => {
		const withHours = plan(2026, {
			weekPageLines: 'hours',
			hourFormat: '24h',
			firstHour: 8,
			lastHour: 10,
		})
		expect(withHours.hours).toEqual(['08:00', '09:00', '10:00'])
		const without = plan(2026, { weekPageLines: 'none' })
		expect(without.hours).toBeUndefined()
		expect(without.weeks.flatMap(days).some((day) => day.schedule)).toBe(false)
	})

	it('highlights the weekend days of the year only, and only when asked', () => {
		// December 29, 2025 – January 4, 2026: the weekend is in 2026.
		const highlighted = (year: number, highlightWeekendDays: boolean) =>
			days(
				week(
					plan(year, { weekendDisplay: 'full', highlightWeekendDays }).weeks,
					'2025-12-29',
				),
			)
				.filter((day) => day.highlighted)
				.map((day) => day.day.key)
		expect(highlighted(2026, true)).toEqual(['2026-01-03', '2026-01-04'])
		expect(highlighted(2025, true)).toEqual([])
		expect(highlighted(2026, false)).toEqual([])
	})

	it('shows the month holding most of the week, framing the week, when asked', () => {
		const shown = plan(2025)
		// The week of December 30, 2024 is mostly in January.
		expect(shown.weeks[0].miniMonth).toMatchObject({
			name: 'January',
			markedWeek: '2024-12-30',
		})
		expect(shown.weeks[0].miniMonth!.month.month).toBe(0)
		const hidden = { ...defaultLayoutConfig('week-per-page').miniMonth, show: false }
		expect(plan(2025, { miniMonth: hidden }).weeks[0].miniMonth).toBeUndefined()
	})

	it('stacks the days in portrait unless the week takes two sheets', () => {
		const portrait = {
			...defaultLayoutConfig('week-per-page').page,
			orientation: 'portrait' as const,
		}
		expect(plan(2026, { page: portrait }).weeks[0].stacked).toBe(true)
		expect(plan(2026, { page: portrait, twoPagesPerWeek: true }).weeks[0].stacked).toBe(false)
		expect(plan(2026).weeks[0].stacked).toBe(false)
	})
})
