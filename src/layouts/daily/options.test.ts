import { describe, expect, it } from 'vitest'

import { parseOptions } from '../LayoutSpec'
import { DAILY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('daily options', () => {
	it('start portrait', () => {
		expect(DAILY_SPEC.defaults().page.orientation).toBe('portrait')
	})

	it('keeps valid fields', () => {
		const defaults = DAILY_SPEC.defaults()
		const options = {
			...defaults,
			calendar: { ...defaults.calendar, month: 2 },
			header: {
				heading: 'weekday',
				fontSize: 18,
				showWeek: false,
				showDayOfYear: false,
				highlightWeekendDays: false,
			},
			miniMonth: {
				...grid,
				show: false,
				showYear: true,
				showEvents: false,
				size: 'small',
				highlightWeekends: 'columns',
			},
			content: {
				twoPages: true,
				fill: 'ruled',
				ruledLineSpacing: 6.5,
				squareSize: 4,
				fillAlignment: 'right',
				genkoYoshi: {
					squareSize: 15.5,
					direction: 'horizontal',
					furigana: 'right',
					guides: true,
				},
				schedule: { hourFormat: '24h', firstHour: 0, lastHour: 23 },
			},
			footer: { show: true, height: 42 },
		}
		const ignored: string[] = []
		expect(parseOptions(DAILY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			calendar: { month: 13 },
			header: {
				heading: 'month',
				fontSize: 2,
				showWeek: 1,
				showDayOfYear: null,
				highlightWeekendDays: 'yes',
			},
			miniMonth: { weekdayFormat: 'long', show: 'no', size: 'tiny' },
			content: {
				twoPages: 'yes',
				fill: 'dotted',
				ruledLineSpacing: 2,
				squareSize: 12,
				fillAlignment: 'middle',
				genkoYoshi: {
					squareSize: 21,
					direction: 'diagonal',
					furigana: 'left',
					guides: 'dotted',
				},
				schedule: { hourFormat: '25h', firstHour: 24, lastHour: 7.5 },
			},
			footer: { show: 'yes', height: 2.5 },
		}
		expect(parseOptions(DAILY_SPEC, options, ignored)).toEqual(DAILY_SPEC.defaults())
		expect(ignored).toEqual([
			'calendar.month',
			'header.heading',
			'header.fontSize',
			'header.showWeek',
			'header.showDayOfYear',
			'header.highlightWeekendDays',
			'miniMonth.show',
			'miniMonth.size',
			'miniMonth.weekdayFormat',
			'content.twoPages',
			'content.fill',
			'content.ruledLineSpacing',
			'content.squareSize',
			'content.fillAlignment',
			'content.genkoYoshi.squareSize',
			'content.genkoYoshi.direction',
			'content.genkoYoshi.furigana',
			'content.genkoYoshi.guides',
			'content.schedule.hourFormat',
			'content.schedule.firstHour',
			'content.schedule.lastHour',
			'footer.show',
			'footer.height',
		])
	})

	it('prints the whole year by default, or one month counted from 1', () => {
		expect(DAILY_SPEC.defaults().calendar.month).toBe('all')
		const month = (value: unknown, ignored: string[] = []) =>
			parseOptions(DAILY_SPEC, { calendar: { month: value } }, ignored).calendar.month
		expect(month(1)).toBe(1)
		expect(month(12)).toBe(12)
		expect(month('all')).toBe('all')
		for (const invalid of [0, 13, '2', 1.5, null]) {
			const ignored: string[] = []
			expect(month(invalid, ignored)).toBe('all')
			expect(ignored).toEqual(['calendar.month'])
		}
		expect(parseOptions(DAILY_SPEC, { calendar: { year: 2030 } }).calendar.month).toBe('all')
	})

	it('keeps the mini month to abbreviated weekday names', () => {
		const parsed = parseOptions(DAILY_SPEC, { miniMonth: { weekdayFormat: 'full' } })
		expect(parsed.miniMonth.weekdayFormat).toBe(DAILY_SPEC.defaults().miniMonth.weekdayFormat)
	})

	it('puts a reversed schedule in order, and keeps an ordered one as is', () => {
		const defaults = DAILY_SPEC.defaults()
		const withHours = (firstHour: number, lastHour: number) => ({
			...defaults,
			content: {
				...defaults.content,
				schedule: { ...defaults.content.schedule, firstHour, lastHour },
			},
		})
		expect(DAILY_SPEC.normalize(withHours(20, 8)).content.schedule).toMatchObject({
			firstHour: 8,
			lastHour: 20,
		})
		const single = withHours(9, 9)
		expect(DAILY_SPEC.normalize(single)).toBe(single)
	})

	it('faces its pages with two pages per day only', () => {
		const defaults = DAILY_SPEC.defaults()
		const withTwoPages = (twoPages: boolean) => ({
			...defaults,
			content: { ...defaults.content, twoPages },
		})
		expect(DAILY_SPEC.facingPages?.(withTwoPages(true))).toBe(true)
		expect(DAILY_SPEC.facingPages?.(withTwoPages(false))).toBe(false)
	})
})
