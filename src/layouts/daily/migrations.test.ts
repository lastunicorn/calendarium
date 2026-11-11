import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { DAILY_MIGRATIONS } from './migrations'
import { DAILY_SPEC } from './options'

describe('daily migrations', () => {
	const from3 = DAILY_MIGRATIONS[3]!
	const from5 = DAILY_MIGRATIONS[5]!

	it('move the 3 month grid options under the mini month', () => {
		const options = {
			year: 2030,
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
			showMiniMonth: false,
		}
		expect(from3(options)).toEqual({
			year: 2030,
			highlightWeekendDays: false,
			miniMonth: {
				show: false,
				weekdayFormat: 'short',
				highlightWeekends: 'off',
				showWeekNumbers: true,
			},
		})
	})

	it('give options that parse, keeping the mini month’s other defaults', () => {
		// Parsed as 6 reads it, after the step from 5 grouped it.
		const parsed = parseOptions(
			DAILY_SPEC,
			from5(from3({ highlightWeekends: 'columns', showMiniMonth: false })),
		)
		expect(parsed).toMatchObject({
			header: { highlightWeekendDays: true },
			miniMonth: {
				...DAILY_SPEC.defaults().miniMonth,
				highlightWeekends: 'columns',
				show: false,
			},
		})
	})

	it('read the 6 development builds’ names of the fill and its alignment too', () => {
		const options = { year: 2030, dayPageFill: 'dots', fillAlignment: 'right' }
		expect(from5(options)).toEqual({
			calendar: { year: 2030 },
			content: { fill: 'dots', fillAlignment: 'right' },
		})
	})
})

describe('daily migrations from 5, the groups', () => {
	const from5 = DAILY_MIGRATIONS[5]!

	// Every field of 5, with a value other than its default.
	const options = {
		year: 2030,
		locale: 'ja-JP',
		weekStart: 0,
		events: '0000-01-01 元日',
		dayPageTitle: 'weekday',
		headingFontSize: 30,
		showHeaderWeek: false,
		showHeaderDayOfYear: false,
		highlightWeekendDays: false,
		miniMonth: {
			show: false,
			showYear: true,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: false,
		},
		twoPagesPerDay: true,
		dayPageLines: 'squares',
		ruledLineSpacing: 7,
		squareSize: 4,
		squareGridAlignment: 'left',
		hourFormat: '24h',
		firstHour: 6,
		lastHour: 22,
		showFooter: true,
		footerHeight: 35,
		page: { orientation: 'landscape' },
	}
	const grouped = {
		calendar: { year: 2030, locale: 'ja-JP', weekStart: 0 },
		events: ['0000-01-01 元日'],
		header: {
			heading: 'weekday',
			fontSize: 30,
			showWeek: false,
			showDayOfYear: false,
			highlightWeekendDays: false,
		},
		miniMonth: {
			show: false,
			showYear: true,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: false,
		},
		content: {
			twoPages: true,
			fill: 'squares',
			ruledLineSpacing: 7,
			squareSize: 4,
			fillAlignment: 'left',
			schedule: { hourFormat: '24h', firstHour: 6, lastHour: 22 },
		},
		footer: { show: true, height: 35 },
		page: { orientation: 'landscape' },
	}

	it('group the 5 fields: the calendar, the events, the header, the content and the footer', () => {
		expect(from5(options)).toEqual(grouped)
	})

	it('give options that parse, keeping every value', () => {
		expect(parseOptions(DAILY_SPEC, from5(options))).toMatchObject(grouped)
	})

	it('leave out a group none of the fields fill', () => {
		expect(from5({ year: 2030 })).toEqual({ calendar: { year: 2030 } })
	})
})
