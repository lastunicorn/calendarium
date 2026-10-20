import { describe, expect, it } from 'vitest'
import { calendarModel } from '../common'
import { defaultLayoutConfig } from '../index'
import type { MonthPerPageConfig } from './options'
import { planMonthPages } from './pages'

/** The plan of the default month layout for `year`, in British English with Monday weeks. */
function plan(year: number, options: Partial<MonthPerPageConfig> = {}) {
	const config: MonthPerPageConfig = {
		...defaultLayoutConfig('month-per-page'),
		year,
		locale: 'en-GB',
		weekStart: 1,
		...options,
	}
	return planMonthPages(config, calendarModel(config))
}

describe('planMonthPages', () => {
	it('plans a page per month, headed by the month and year', () => {
		const pages = plan(2026)
		expect(pages.map((page) => page.key)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		expect(pages[0].heading).toBe('January 2026')
	})

	it('heads every page with the title, the month and year below it, when there is one', () => {
		const pages = plan(2026, { title: ' Family ' })
		expect(pages[0].heading).toBe('Family')
		expect(pages[0].subheading).toBe('January 2026')
		expect(pages[11].heading).toBe('Family')
		expect(pages[11].subheading).toBe('December 2026')
		expect(plan(2026, { title: '  ' })[0]).toMatchObject({
			heading: 'January 2026',
			subheading: '',
		})
	})

	it('centers the heading unless told where to set it', () => {
		expect(plan(2026)[0].headingAlign).toBe('center')
		expect(plan(2026, { monthHeadingAlignment: 'right' })[3].headingAlign).toBe('right')
	})

	it('draws only the rows holding a day of the month', () => {
		// February 2021 runs from Monday the 1st to Sunday the 28th; May 2021 spans six Monday weeks.
		const pages = plan(2021)
		expect(pages[1].grid.weeks).toHaveLength(4)
		expect(pages[4].grid.weeks).toHaveLength(6)
	})

	it('leaves out the days of the previous and next month unless told to show them', () => {
		expect(plan(2026)[0].grid.showAdjacentMonthDays).toBe(false)
		expect(plan(2026, { showAdjacentMonthDays: true })[0].grid.showAdjacentMonthDays).toBe(true)
	})

	it('rules the grid unless told not to', () => {
		expect(plan(2026)[0].grid.showGridLines).toBe(true)
		expect(plan(2026, { showGridLines: false })[0].grid.showGridLines).toBe(false)
	})

	it('writes the day numbers in 14 pt unless told another size', () => {
		expect(plan(2026)[0].grid.dayNumberFontSize).toBe(14)
		expect(plan(2026, { dayNumberFontSize: 24 })[0].grid.dayNumberFontSize).toBe(24)
	})

	it('sets the day numbers top left unless told where', () => {
		expect(plan(2026)[0].grid).toMatchObject({
			dayNumberHorizontalAlignment: 'left',
			dayNumberVerticalAlignment: 'top',
		})
		expect(
			plan(2026, {
				dayNumberHorizontalAlignment: 'right',
				dayNumberVerticalAlignment: 'bottom',
			})[0].grid,
		).toMatchObject({
			dayNumberHorizontalAlignment: 'right',
			dayNumberVerticalAlignment: 'bottom',
		})
	})

	it('writes the weekday names in full when asked', () => {
		expect(plan(2026, { weekdayFormat: 'full' })[0].grid.weekdays[2]).toBe('Wednesday')
	})

	it('shares the weekday labels and the grid options between the pages', () => {
		const pages = plan(2026, { weekdayFormat: 'narrow', showWeekNumbers: false })
		expect(pages[0].grid.weekdays).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
		expect(pages[5].grid.weekdays).toBe(pages[0].grid.weekdays)
		expect(pages[0].grid.showWeekNumbers).toBe(false)
	})

	it('writes the events in their days of the month, yearly ones every year', () => {
		const events = '0000-01-01 New Year\n2026-01-01 Holiday\n2027-01-01 Later\nnot an event'
		const days = plan(2026, { events }).flatMap((page) => page.grid.weeks.flat())
		const newYear = days.find((day) => day.key === '2026-01-01' && day.inMonth)!
		expect(newYear.events).toEqual(['New Year', 'Holiday'])
		// January 1 also shows in December's grid, as a day of another month, without events.
		expect(days.filter((day) => !day.inMonth).every((day) => day.events.length === 0)).toBe(
			true,
		)
		expect(days.find((day) => day.key === '2026-01-02')!.events).toEqual([])
	})

	it('draws the previous and the next month small, each named with its year', () => {
		const pages = plan(2026)
		expect(pages[5].previousMonth).toMatchObject({
			name: 'May 2026',
			month: { year: 2026, month: 4 },
		})
		expect(pages[5].nextMonth).toMatchObject({
			name: 'July 2026',
			month: { year: 2026, month: 6 },
		})
		expect(pages[0].previousMonth).toMatchObject({
			name: 'December 2025',
			month: { year: 2025, month: 11 },
		})
		expect(pages[11].nextMonth).toMatchObject({
			name: 'January 2027',
			month: { year: 2027, month: 0 },
		})
		expect(pages[0].previousMonth!.weekdays).toBe(pages[11].nextMonth!.weekdays)
	})

	it('leaves out the previous or the next month when hidden', () => {
		const shown = defaultLayoutConfig('month-per-page').adjacentMonths
		const noPrevious = plan(2026, { adjacentMonths: { ...shown, showPreviousMonth: false } })[3]
		expect(noPrevious.previousMonth).toBeUndefined()
		expect(noPrevious.nextMonth).toMatchObject({ name: 'May 2026' })
		const noNext = plan(2026, { adjacentMonths: { ...shown, showNextMonth: false } })[3]
		expect(noNext.previousMonth).toMatchObject({ name: 'March 2026' })
		expect(noNext.nextMonth).toBeUndefined()
	})
})
