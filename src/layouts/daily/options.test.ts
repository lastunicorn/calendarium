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
})
