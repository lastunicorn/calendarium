import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { MONTHLY_MIGRATIONS } from './migrations'
import { MONTHLY_SPEC } from './options'

describe('monthly migrations', () => {
	const from5 = MONTHLY_MIGRATIONS[5]!

	// Every field of 5, with a value other than its default.
	const options = {
		year: 2030,
		locale: 'it-IT',
		weekStart: 'auto',
		events: '2030-08-15 Ferragosto\nnot an event',
		title: 'Office',
		monthHeadingAlignment: 'right',
		headingFontSize: 40,
		weekdayFormat: 'short',
		highlightWeekends: 'off',
		showWeekNumbers: true,
		showAdjacentMonthDays: true,
		showGridLines: false,
		weekdayFontSize: 12,
		dayNumberFontSize: 24,
		dayNumberHorizontalAlignment: 'right',
		dayNumberVerticalAlignment: 'bottom',
		adjacentMonths: {
			showPreviousMonth: false,
			showNextMonth: true,
			showYear: false,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
		},
		page: { orientation: 'portrait' },
	}
	const grouped = {
		calendar: { year: 2030, locale: 'it-IT', weekStart: 'auto' },
		events: ['2030-08-15 Ferragosto', 'not an event'],
		header: { title: 'Office', alignment: 'right', fontSize: 40 },
		miniMonth: {
			showPreviousMonth: false,
			showNextMonth: true,
			showYear: false,
			size: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
		},
		content: {
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
			showAdjacentMonthDays: true,
			showGridLines: false,
			weekdayFontSize: 12,
			dayNumber: { fontSize: 24, horizontalAlignment: 'right', verticalAlignment: 'bottom' },
		},
		page: { orientation: 'portrait' },
	}

	it('group the 5 fields: the calendar, the events, the header, the mini month and the content', () => {
		expect(from5(options)).toEqual(grouped)
	})

	it('give options that parse, keeping every value', () => {
		expect(parseOptions(MONTHLY_SPEC, from5(options))).toMatchObject(grouped)
	})

	it('add no mini month when there were no adjacent months', () => {
		const { adjacentMonths: _, ...withoutAdjacentMonths } = options
		const { miniMonth: __, ...expected } = grouped
		expect(from5(withoutAdjacentMonths)).toEqual(expected)
	})

	it('leave out a group none of the fields fill', () => {
		expect(from5({ year: 2030 })).toEqual({ calendar: { year: 2030 } })
	})
})
