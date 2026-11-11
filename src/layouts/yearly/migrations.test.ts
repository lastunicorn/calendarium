import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { YEARLY_MIGRATIONS } from './migrations'
import { YEARLY_SPEC } from './options'

describe('yearly migrations', () => {
	const from5 = YEARLY_MIGRATIONS[5]!

	// Every field of 5, with a value other than its default.
	const options = {
		year: 2030,
		locale: 'fr-FR',
		weekStart: 1,
		events: '0000-07-14 Fête nationale',
		title: 'Ours',
		subtitle: 'Birthdays',
		headingFontSize: 40,
		monthSize: 'large',
		weekdayFormat: 'short',
		highlightWeekends: 'off',
		showWeekNumbers: true,
		page: { orientation: 'landscape' },
	}
	const grouped = {
		calendar: { year: 2030, locale: 'fr-FR', weekStart: 1 },
		events: ['0000-07-14 Fête nationale'],
		header: { title: 'Ours', subtitle: 'Birthdays', fontSize: 40 },
		content: {
			monthSize: 'large',
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
		},
		page: { orientation: 'landscape' },
	}

	it('group the 5 fields: the calendar, the events, the header and the content', () => {
		expect(from5(options)).toEqual(grouped)
	})

	it('give options that parse, keeping every value', () => {
		expect(parseOptions(YEARLY_SPEC, from5(options))).toMatchObject(grouped)
	})

	it('leave out a group none of the fields fill', () => {
		expect(from5({ year: 2030 })).toEqual({ calendar: { year: 2030 } })
	})
})
