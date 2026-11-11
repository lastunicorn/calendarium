import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { WEEKLY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('weekly options', () => {
	it('start landscape', () => {
		expect(WEEKLY_SPEC.defaults().page.orientation).toBe('landscape')
	})

	it('keeps valid fields', () => {
		const options = {
			...WEEKLY_SPEC.defaults(),
			header: { alignment: 'right', fontSize: 32, showWeek: false },
			miniMonth: {
				showCurrentMonth: true,
				showNextMonth: true,
				showEvents: false,
				showYear: true,
				size: 'large',
				...grid,
			},
			content: {
				twoPages: true,
				startPage: 'even',
				dayDirection: 'horizontal',
				weekdayFormat: 'narrow',
				highlightWeekendDays: false,
				weekendDisplay: 'reduced',
				fill: 'hours',
				schedule: { hourFormat: '12h', firstHour: 8, lastHour: 18 },
			},
			footer: { show: true, height: 42 },
		}
		const ignored: string[] = []
		expect(parseOptions(WEEKLY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			header: { showWeek: 'yes' },
			content: {
				twoPages: 0,
				dayDirection: 'diagonal',
				weekdayFormat: 'long',
				highlightWeekendDays: 'days',
				weekendDisplay: 'off',
				fill: 'ruled',
				schedule: { hourFormat: 12, firstHour: -1, lastHour: '21' },
			},
		}
		expect(parseOptions(WEEKLY_SPEC, options, ignored)).toEqual(WEEKLY_SPEC.defaults())
		expect(ignored).toEqual([
			'header.showWeek',
			'content.twoPages',
			'content.dayDirection',
			'content.weekdayFormat',
			'content.highlightWeekendDays',
			'content.weekendDisplay',
			'content.fill',
			'content.schedule.hourFormat',
			'content.schedule.firstHour',
			'content.schedule.lastHour',
		])
	})

	it('keeps full weekday names on the page, but not in the mini months', () => {
		const defaults = WEEKLY_SPEC.defaults()
		const parsed = parseOptions(WEEKLY_SPEC, {
			content: { weekdayFormat: 'full' },
			miniMonth: { weekdayFormat: 'full' },
		})
		expect(parsed.content.weekdayFormat).toBe('full')
		expect(parsed.miniMonth.weekdayFormat).toBe(defaults.miniMonth.weekdayFormat)
	})

	it('puts a reversed schedule in order', () => {
		const defaults = WEEKLY_SPEC.defaults()
		const options = {
			...defaults,
			content: {
				...defaults.content,
				schedule: { ...defaults.content.schedule, firstHour: 18, lastHour: 9 },
			},
		}
		expect(WEEKLY_SPEC.normalize(options).content.schedule).toMatchObject({
			firstHour: 9,
			lastHour: 18,
		})
		expect(
			parseOptions(WEEKLY_SPEC, { content: { schedule: { firstHour: 22, lastHour: 6 } } })
				.content.schedule,
		).toMatchObject({ firstHour: 6, lastHour: 22 })
	})

	it('keeps the options as they are when the schedule is in order', () => {
		const defaults = WEEKLY_SPEC.defaults()
		expect(WEEKLY_SPEC.normalize(defaults)).toBe(defaults)
	})
})
