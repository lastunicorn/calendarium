import { describe, expect, it } from 'vitest'

import { parseOptions } from '../LayoutSpec'
import { WEEKLY_MIGRATIONS } from './migrations'
import { WEEKLY_SPEC } from './options'

describe('weekly migrations', () => {
	const from3 = WEEKLY_MIGRATIONS[3]!

	it('turn the 3 weekend highlight and week numbers into the heading’s options', () => {
		const options = { year: 2030, highlightWeekends: 'columns', showWeekNumbers: false }
		expect(from3(options)).toEqual({
			year: 2030,
			highlightWeekendDays: true,
			showHeaderWeek: false,
		})
		// Parsed as 6 reads it, after the step from 5 grouped it.
		const from5 = WEEKLY_MIGRATIONS[5]!
		const parsed = parseOptions(WEEKLY_SPEC, from5(from3({ highlightWeekends: 'off' })))
		expect(parsed.content.highlightWeekendDays).toBe(false)
	})

	it('keep an unknown weekend highlight for parsing to reject', () => {
		expect(from3({ highlightWeekends: 'always' })).toMatchObject({
			highlightWeekendDays: 'always',
		})
	})

	const from4 = WEEKLY_MIGRATIONS[4]!

	it('turn the automatic days direction into what it drew', () => {
		const portrait = { orientation: 'portrait' }
		const landscape = { orientation: 'landscape' }
		const direction = (options: object) =>
			from4({ weekDayDirection: 'auto', ...options }).weekDayDirection
		expect(direction({ page: portrait })).toBe('horizontal')
		expect(direction({ page: portrait, twoPagesPerWeek: true })).toBe('vertical')
		expect(direction({ page: landscape })).toBe('vertical')
		expect(direction({ page: landscape, twoPagesPerWeek: true })).toBe('vertical')
		expect(direction({})).toBe('vertical')
	})

	it('keep any other days direction as is', () => {
		const options = { weekDayDirection: 'horizontal', page: { orientation: 'landscape' } }
		expect(from4(options)).toBe(options)
	})
})

describe('weekly migrations from 5', () => {
	const from5 = WEEKLY_MIGRATIONS[5]!

	// Every field of 5, with a value other than its default.
	const options = {
		year: 2030,
		locale: 'de-DE',
		weekStart: 0,
		events: '0000-10-03 Tag der Einheit',
		headingAlignment: 'right',
		headingFontSize: 28,
		showHeaderWeek: false,
		miniMonth: {
			show: false,
			showYear: true,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: false,
		},
		showNextMonth: true,
		twoPagesPerWeek: true,
		startPage: 'even',
		weekDayDirection: 'horizontal',
		weekdayFormat: 'full',
		highlightWeekendDays: false,
		weekendDisplay: 'full',
		weekPageLines: 'none',
		hourFormat: '24h',
		firstHour: 6,
		lastHour: 22,
		showFooter: true,
		footerHeight: 35,
		page: { orientation: 'portrait' },
	}
	const grouped = {
		calendar: { year: 2030, locale: 'de-DE', weekStart: 0 },
		events: ['0000-10-03 Tag der Einheit'],
		header: { alignment: 'right', fontSize: 28, showWeek: false },
		miniMonth: {
			showCurrentMonth: false,
			showYear: true,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: false,
			showNextMonth: true,
		},
		content: {
			twoPages: true,
			startPage: 'even',
			dayDirection: 'horizontal',
			weekdayFormat: 'full',
			highlightWeekendDays: false,
			weekendDisplay: 'full',
			fill: 'none',
			schedule: { hourFormat: '24h', firstHour: 6, lastHour: 22 },
		},
		footer: { show: true, height: 35 },
		page: { orientation: 'portrait' },
	}

	it('group the 5 fields: the calendar, the events, the header, the mini months, the content and the footer', () => {
		expect(from5(options)).toEqual(grouped)
	})

	it('give options that parse, keeping every value', () => {
		expect(parseOptions(WEEKLY_SPEC, from5(options))).toMatchObject(grouped)
	})

	it('add the next month to the mini months even without a 5 mini month', () => {
		const { miniMonth: _, ...withoutMiniMonth } = options
		expect(from5(withoutMiniMonth).miniMonth).toEqual({ showNextMonth: true })
	})

	it('keep a mini month without `show` as it is', () => {
		expect(from5({ miniMonth: { size: 'small' } })).toEqual({ miniMonth: { size: 'small' } })
	})

	it('leave out a group none of the fields fill', () => {
		expect(from5({ year: 2030 })).toEqual({ calendar: { year: 2030 } })
	})
})
