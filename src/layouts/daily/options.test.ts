import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { DAILY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('daily options', () => {
	it('start portrait', () => {
		expect(DAILY_SPEC.defaults().page.orientation).toBe('portrait')
	})

	it('keeps valid fields', () => {
		const options = {
			...DAILY_SPEC.defaults(),
			dayPageTitle: 'weekday',
			headingFontSize: 18,
			dayPageFill: 'ruled',
			ruledLineSpacing: 6.5,
			squareSize: 4,
			fillAlignment: 'right',
			genkoYoshiSquareSize: 15.5,
			genkoYoshiDirection: 'horizontal',
			genkoYoshiFurigana: 'right',
			genkoYoshiGuides: true,
			twoPagesPerDay: true,
			hourFormat: '24h',
			firstHour: 0,
			lastHour: 23,
			footer: { show: true, height: 42 },
			highlightWeekendDays: false,
			miniMonth: {
				...grid,
				show: false,
				showYear: true,
				showEvents: false,
				size: 'small',
				highlightWeekends: 'columns',
			},
			showHeaderWeek: false,
			showHeaderDayOfYear: false,
		}
		const ignored: string[] = []
		expect(parseOptions(DAILY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			dayPageTitle: 'month',
			dayPageFill: 'dotted',
			ruledLineSpacing: 2,
			squareSize: 12,
			fillAlignment: 'middle',
			genkoYoshiSquareSize: 21,
			genkoYoshiDirection: 'diagonal',
			genkoYoshiFurigana: 'left',
			genkoYoshiGuides: 'dotted',
			twoPagesPerDay: 'yes',
			hourFormat: '25h',
			firstHour: 24,
			lastHour: 7.5,
			footer: { show: 'yes', height: 2.5 },
			highlightWeekendDays: 'yes',
			miniMonth: { weekdayFormat: 'long', show: 'no', size: 'tiny' },
			showHeaderWeek: 1,
			showHeaderDayOfYear: null,
		}
		expect(parseOptions(DAILY_SPEC, options, ignored)).toEqual(DAILY_SPEC.defaults())
		expect(ignored).toContain('miniMonth.weekdayFormat')
		expect(ignored).toContain('miniMonth.show')
		expect(ignored).toContain('miniMonth.size')
		expect(ignored).toContain('footer.show')
		expect(ignored).toContain('footer.height')
		expect(ignored).toHaveLength(Object.keys(options).length + 3)
	})

	it('keeps the mini month to abbreviated weekday names', () => {
		const parsed = parseOptions(DAILY_SPEC, { miniMonth: { weekdayFormat: 'full' } })
		expect(parsed.miniMonth.weekdayFormat).toBe(DAILY_SPEC.defaults().miniMonth.weekdayFormat)
	})

	it('puts a reversed schedule in order, and keeps an ordered one as is', () => {
		const reversed = { ...DAILY_SPEC.defaults(), firstHour: 20, lastHour: 8 }
		expect(DAILY_SPEC.normalize(reversed)).toMatchObject({ firstHour: 8, lastHour: 20 })
		const single = { ...DAILY_SPEC.defaults(), firstHour: 9, lastHour: 9 }
		expect(DAILY_SPEC.normalize(single)).toBe(single)
	})
})
