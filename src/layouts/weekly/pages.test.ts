import { describe, expect, it } from 'vitest'
import { applyPatch, type Patch } from '../../core/data'
import { calendarModel } from '../common'
import { defaultLayoutOptions } from '../index'
import type { WeeklyOptions } from './options'
import { planWeekPages, type WeekPageDay, type WeekPages } from './pages'

/** The plan of the default week layout for `year`, in British English with Monday weeks, changed by `changes`. */
function plan(year: number, changes: Patch<WeeklyOptions> = {}) {
	const options = applyPatch(defaultLayoutOptions('weekly'), {
		calendar: { year, locale: 'en-GB', weekStart: 1 },
		...changes,
	})
	return planWeekPages(options, calendarModel(options))
}

/** The week starting on the day keyed `key`. */
function week(weeks: WeekPages[], key: string): WeekPages {
	return weeks.find((candidate) => candidate.key === key)!
}

/** Every day of `week`'s sheets, in order. */
function days(week: WeekPages): WeekPageDay[] {
	return week.sheets.flatMap((sheet) => sheet.cells.flat())
}

/** Each sheet of `week` as the event lines of its days, in order. */
function sheetEventLines(week: WeekPages): number[][] {
	return week.sheets.map((sheet) => sheet.cells.flat().map((day) => day.eventLines))
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
		expect(
			plan(2028, { calendar: { year: 2028, locale: 'en-GB', weekStart: 0 } }).weeks,
		).toHaveLength(54)
	})

	it('skips a week whose only days of the year are a hidden weekend', () => {
		// 2022 starts on a Saturday: its first Monday week holds only January 1 and 2.
		expect(plan(2022).weeks).toHaveLength(53)
		const { weeks } = plan(2022, { content: { weekendDisplay: 'hidden' } })
		expect(weeks).toHaveLength(52)
		expect(weeks[0].key).toBe('2022-01-03')
	})

	it('heads a week with its dates and, when asked, its ISO week', () => {
		const shown = week(plan(2026).weeks, '2026-10-19')
		expect(shown.heading).toContain('October 2026')
		expect(shown.subheading).toBe('Week 43')
		expect(
			week(plan(2026, { header: { showWeek: false } }).weeks, '2026-10-19').subheading,
		).toBe('')
	})

	it('sets the heading in the chosen font size', () => {
		expect(week(plan(2026).weeks, '2026-10-19').headingFontSize).toBe(20)
		expect(
			week(plan(2026, { header: { fontSize: 36 } }).weeks, '2026-10-19').headingFontSize,
		).toBe(36)
	})

	it('sets the heading left beside the mini months or over two pages, unless told where', () => {
		const align = (options: Patch<WeeklyOptions>) =>
			week(plan(2026, options).weeks, '2026-10-19').headingAlign
		const twoPages = { twoPages: true }
		expect(align({ miniMonth: { showCurrentMonth: false } })).toBe('center')
		expect(align({})).toBe('left')
		expect(align({ miniMonth: { showCurrentMonth: false, showNextMonth: true } })).toBe('left')
		expect(align({ content: twoPages, miniMonth: { showCurrentMonth: false } })).toBe('left')
		expect(align({ header: { alignment: 'right' } })).toBe('right')
		expect(
			align({
				header: { alignment: 'center' },
				content: twoPages,
				miniMonth: { showCurrentMonth: false },
			}),
		).toBe('center')
	})

	it('puts the whole week on one sheet, or Monday to Wednesday then the rest on two', () => {
		const one = week(plan(2026, { content: { weekendDisplay: 'full' } }).weeks, '2026-10-19')
		expect(one.sheets.map((sheet) => sheet.header)).toEqual(['both'])
		const two = week(
			plan(2026, { content: { weekendDisplay: 'full', twoPages: true } }).weeks,
			'2026-10-19',
		)
		expect(two.sheets.map((sheet) => sheet.header)).toEqual(['heading', 'miniMonth'])
		expect(sheetWeekdays(two)).toEqual([
			[[1], [2], [3]],
			[[4], [5], [6], [0]],
		])
	})

	it('puts a blank page first only when the weeks start on an even page', () => {
		expect(plan(2026).blankFirstPage).toBe(false)
		expect(plan(2026, { content: { startPage: 'even' } }).blankFirstPage).toBe(true)
	})

	it('keeps an empty footer under every week only when shown', () => {
		expect(plan(2026).weeks.every((week) => week.footerHeight === undefined)).toBe(true)
		expect(
			plan(2026, { footer: { show: true, height: 35 } }).weeks.every(
				(week) => week.footerHeight === 35,
			),
		).toBe(true)
	})

	it('labels each day with its weekday from the week start, in the chosen format', () => {
		const saturdays = plan(2026, {
			calendar: { year: 2026, locale: 'en-GB', weekStart: 6 },
			content: { weekendDisplay: 'full' },
		}).weeks[1]
		expect(days(saturdays).map((day) => day.weekday)).toEqual([
			'Sat',
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
		])
		const narrow = plan(2026, { content: { weekdayFormat: 'narrow' } }).weeks[1]
		expect(days(narrow)[0].weekday).toBe('M')
		const full = plan(2026, { content: { weekdayFormat: 'full' } }).weeks[1]
		expect(days(full)[0].weekday).toBe('Monday')
	})

	it('gives a schedule to each day of the year in a cell of its own', () => {
		const scheduled = (options: Patch<WeeklyOptions>) =>
			plan(2025, { ...options, content: { fill: 'hours', ...options.content } })
				.weeks.flatMap(days)
				.filter((day) => day.schedule).length
		// One per day of 2025, none for the days of 2024 and 2026 on the first and last week.
		expect(scheduled({ content: { weekendDisplay: 'full' } })).toBe(365)
		// Its 104 weekend days share cells.
		expect(scheduled({ content: { weekendDisplay: 'reduced' } })).toBe(261)
		// A week starting on Sunday can't reduce its weekend, so its cells keep the schedule.
		expect(
			scheduled({
				content: { weekendDisplay: 'reduced' },
				calendar: { year: 2026, locale: 'en-GB', weekStart: 0 },
			}),
		).toBe(365)
	})

	it('labels the schedule’s hours once, only when the cells hold it', () => {
		const withHours = plan(2026, {
			content: { fill: 'hours', schedule: { hourFormat: '24h', firstHour: 8, lastHour: 10 } },
		})
		expect(withHours.hours).toEqual(['08:00', '09:00', '10:00'])
		const without = plan(2026, { content: { fill: 'none' } })
		expect(without.hours).toBeUndefined()
		expect(without.weeks.flatMap(days).some((day) => day.schedule)).toBe(false)
	})

	it('highlights the weekend days of the year only, and only when asked', () => {
		// December 29, 2025 – January 4, 2026: the weekend is in 2026.
		const highlighted = (year: number, highlightWeekendDays: boolean) =>
			days(
				week(
					plan(year, { content: { weekendDisplay: 'full', highlightWeekendDays } }).weeks,
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
		expect(shown.weeks[0].miniMonths).toHaveLength(1)
		expect(shown.weeks[0].miniMonths[0]).toMatchObject({
			name: 'January',
			markedWeek: '2024-12-30',
			size: 'medium',
		})
		expect(shown.weeks[0].miniMonths[0].month.month).toBe(0)
		expect(plan(2025, { miniMonth: { showYear: true } }).weeks[0].miniMonths[0]).toMatchObject({
			name: 'January 2025',
		})
		expect(plan(2025, { miniMonth: { size: 'small' } }).weeks[0].miniMonths[0]).toMatchObject({
			size: 'small',
		})
		const hidden = { showCurrentMonth: false }
		expect(plan(2025, { miniMonth: hidden }).weeks[0].miniMonths).toEqual([])
	})

	it('shows the next month right of the week’s, alone or not, when asked', () => {
		const both = week(
			plan(2026, { miniMonth: { showNextMonth: true } }).weeks,
			'2026-10-26',
		).miniMonths
		// The week of October 26 reaches into November, its row marked in both months.
		expect(both.map((miniMonth) => miniMonth.name)).toEqual(['October', 'November'])
		expect(both.map((miniMonth) => miniMonth.markedWeek)).toEqual(['2026-10-26', '2026-10-26'])
		const alone = plan(2026, {
			miniMonth: { showCurrentMonth: false, showNextMonth: true },
		}).weeks
		expect(week(alone, '2026-10-26').miniMonths.map((miniMonth) => miniMonth.name)).toEqual([
			'November',
		])
	})

	it('takes December’s next month from the next year', () => {
		const next = plan(2026, { miniMonth: { showYear: true, showNextMonth: true } }).weeks.at(
			-1,
		)!.miniMonths[1]
		expect(next.name).toBe('January 2027')
		expect(next.month).toMatchObject({ year: 2027, month: 0 })
	})

	it('circles the days with an event in the mini months, the next year’s too', () => {
		const events = [
			'2026-12-08 Trip',
			'0000-12-25 Christmas',
			'0000-01-06 Epiphany',
			'2026-01-06 Other',
		]
		const last = plan(2026, { events, miniMonth: { showNextMonth: true } }).weeks.at(
			-1,
		)!.miniMonths
		expect(last.map((miniMonth) => miniMonth.eventDays)).toEqual([[8, 25], [6]])
		expect(plan(2026).weeks[0].miniMonths[0].eventDays).toEqual([])
		const hidden = { showEvents: false, showNextMonth: true }
		const without = plan(2026, { events, miniMonth: hidden }).weeks.at(-1)!
		expect(without.miniMonths.map((miniMonth) => miniMonth.eventDays)).toEqual([[], []])
	})

	it('stacks the days only when horizontal, whatever the page', () => {
		const portrait = {
			...defaultLayoutOptions('weekly').page,
			orientation: 'portrait' as const,
		}
		expect(plan(2026).weeks[0].stacked).toBe(false)
		expect(plan(2026, { page: portrait }).weeks[0].stacked).toBe(false)
		expect(plan(2026, { content: { dayDirection: 'horizontal' } }).weeks[0].stacked).toBe(true)
		expect(
			plan(2026, { content: { dayDirection: 'horizontal', twoPages: true } }).weeks[0]
				.stacked,
		).toBe(true)
	})

	it('lists the events of the days of the year under their labels', () => {
		const events = ['0000-01-01 New Year', '0000-12-31 Eve', '2026-01-02 Back']
		const first = days(week(plan(2026, { events }).weeks, '2025-12-29'))
		const named = Object.fromEntries(first.map((day) => [day.day.key, day.events]))
		expect(named['2026-01-01']).toEqual(['New Year'])
		expect(named['2026-01-02']).toEqual(['Back'])
		// December 31 of the year before is gray, without its yearly event.
		expect(named['2025-12-31']).toEqual([])
	})

	it('keeps as many event lines in every cell of a week as its busiest day has, on both sheets', () => {
		// The first sheet holds Monday to Wednesday, the second Thursday on.
		const events = ['2026-01-01 One', '2026-01-01 Two', '2026-01-07 Three']
		const weeks = plan(2026, {
			events,
			content: { twoPages: true, weekendDisplay: 'full' },
		}).weeks
		expect(sheetEventLines(week(weeks, '2025-12-29'))).toEqual([
			[2, 2, 2],
			[2, 2, 2, 2],
		])
		expect(sheetEventLines(week(weeks, '2026-01-05'))).toEqual([
			[1, 1, 1],
			[1, 1, 1, 1],
		])
		expect(sheetEventLines(week(weeks, '2026-01-12'))).toEqual([
			[0, 0, 0],
			[0, 0, 0, 0],
		])
	})

	it('leaves a shared weekend cell out of the event lines of the cells of one day', () => {
		// August 15, 2027 is a Sunday, sharing its cell with Saturday.
		const events = ['2027-08-15 One', '2027-08-15 Two', '2027-08-16 Three']
		const weeks = plan(2027, { events, content: { weekendDisplay: 'reduced' } }).weeks
		expect(sheetEventLines(week(weeks, '2027-08-09'))).toEqual([[0, 0, 0, 0, 0, 2, 2]])
		expect(sheetEventLines(week(weeks, '2027-08-16'))).toEqual([[1, 1, 1, 1, 1, 0, 0]])
	})

	it('leaves a shared weekend cell out of the event lines of the other sheet', () => {
		// The first sheet holds Monday to Wednesday, the second Thursday, Friday and the weekend.
		const events = ['2027-08-15 One', '2027-08-15 Two']
		const weeks = plan(2027, {
			events,
			content: { twoPages: true, weekendDisplay: 'reduced' },
		}).weeks
		expect(sheetEventLines(week(weeks, '2027-08-09'))).toEqual([
			[0, 0, 0],
			[0, 0, 2, 2],
		])
	})
})
