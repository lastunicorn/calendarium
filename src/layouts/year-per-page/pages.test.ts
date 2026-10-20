import { describe, expect, it } from 'vitest'
import { calendarModel } from '../common'
import { defaultLayoutConfig } from '../index'
import type { YearPerPageConfig } from './options'
import { planYearPage } from './pages'

/** The plan of the default year layout for 2026, in British English with Monday weeks. */
function plan(options: Partial<YearPerPageConfig> = {}) {
	const config: YearPerPageConfig = {
		...defaultLayoutConfig('year-per-page'),
		year: 2026,
		locale: 'en-GB',
		weekStart: 1,
		...options,
	}
	return planYearPage(config, calendarModel(config))
}

describe('planYearPage', () => {
	it('heads the page with the title, or the year when it is empty', () => {
		expect(plan({ title: '  Family calendar ', subtitle: 'Ours' })).toMatchObject({
			heading: 'Family calendar',
			subheading: 'Ours',
		})
		expect(plan({ title: '   ' }).heading).toBe('2026')
	})

	it('draws the 12 months, each 6 rows so they line up', () => {
		const { months } = plan()
		expect(months.map((month) => month.name)).toEqual([
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		])
		expect(months.every((month) => month.month.weeks.length === 6)).toBe(true)
		expect(months[0].markedDay).toBeUndefined()
	})
})
