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
		expect(plan({ title: '', locale: 'ja-JP' }).heading).toBe('2026年')
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

	it('circles the days with an event, on their date or every year', () => {
		const { months } = plan({
			events: '2026-01-05 Trip\n0000-01-20 Birthday\n2027-01-07 Next year\n2026-02-01 Feb',
		})
		expect(months[0].eventDays).toEqual([5, 20])
		expect(months[1].eventDays).toEqual([1])
		expect(months[2].eventDays).toEqual([])
	})

	it('lists the year’s events by date on a second page, when it has any', () => {
		expect(plan().eventList).toBeUndefined()
		expect(plan({ events: '2027-01-07 Next year' }).eventList).toBeUndefined()
		expect(
			plan({ title: 'Ours', events: '2026-03-01 Trip\n0000-01-20 Birthday' }).eventList,
		).toEqual({
			heading: 'Events',
			subheading: 'Ours',
			events: [
				{ key: '2026-01-20-0', date: '20 January', name: 'Birthday' },
				{ key: '2026-03-01-1', date: '1 March', name: 'Trip' },
			],
		})
	})
})
