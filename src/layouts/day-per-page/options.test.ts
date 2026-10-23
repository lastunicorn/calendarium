import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { DAY_PER_PAGE_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('day-per-page options', () => {
	it('start portrait', () => {
		expect(DAY_PER_PAGE_SPEC.defaults().page.orientation).toBe('portrait')
	})

	it('keeps valid fields', () => {
		const options = {
			...DAY_PER_PAGE_SPEC.defaults(),
			dayPageTitle: 'weekday',
			headingFontSize: 18,
			dayPageLines: 'ruled',
			ruledLineSpacing: 6.5,
			squareSize: 4,
			squareGridAlignment: 'right',
			twoPagesPerDay: true,
			hourFormat: '24h',
			firstHour: 0,
			lastHour: 23,
			highlightWeekendDays: false,
			miniMonth: {
				...grid,
				show: false,
				showYear: true,
				size: 'small',
				highlightWeekends: 'columns',
			},
			showHeaderWeek: false,
			showHeaderDayOfYear: false,
		}
		const ignored: string[] = []
		expect(parseOptions(DAY_PER_PAGE_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			dayPageTitle: 'month',
			dayPageLines: 'dotted',
			ruledLineSpacing: 2,
			squareSize: 12,
			squareGridAlignment: 'middle',
			twoPagesPerDay: 'yes',
			hourFormat: '25h',
			firstHour: 24,
			lastHour: 7.5,
			highlightWeekendDays: 'yes',
			miniMonth: { weekdayFormat: 'long', show: 'no', size: 'tiny' },
			showHeaderWeek: 1,
			showHeaderDayOfYear: null,
		}
		expect(parseOptions(DAY_PER_PAGE_SPEC, options, ignored)).toEqual(
			DAY_PER_PAGE_SPEC.defaults(),
		)
		expect(ignored).toContain('miniMonth.weekdayFormat')
		expect(ignored).toContain('miniMonth.show')
		expect(ignored).toContain('miniMonth.size')
		expect(ignored).toHaveLength(Object.keys(options).length + 2)
	})

	it('keeps the mini month to abbreviated weekday names', () => {
		const parsed = parseOptions(DAY_PER_PAGE_SPEC, { miniMonth: { weekdayFormat: 'full' } })
		expect(parsed.miniMonth.weekdayFormat).toBe(
			DAY_PER_PAGE_SPEC.defaults().miniMonth.weekdayFormat,
		)
	})

	it('puts a reversed schedule in order, and keeps an ordered one as is', () => {
		const reversed = { ...DAY_PER_PAGE_SPEC.defaults(), firstHour: 20, lastHour: 8 }
		expect(DAY_PER_PAGE_SPEC.normalize(reversed)).toMatchObject({ firstHour: 8, lastHour: 20 })
		const single = { ...DAY_PER_PAGE_SPEC.defaults(), firstHour: 9, lastHour: 9 }
		expect(DAY_PER_PAGE_SPEC.normalize(single)).toBe(single)
	})
})
