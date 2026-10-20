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

	it('shares the weekday labels and the grid options between the pages', () => {
		const pages = plan(2026, { weekdayFormat: 'narrow', showWeekNumbers: false })
		expect(pages[0].grid.weekdays).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
		expect(pages[5].grid.weekdays).toBe(pages[0].grid.weekdays)
		expect(pages[0].grid.showWeekNumbers).toBe(false)
	})
})
