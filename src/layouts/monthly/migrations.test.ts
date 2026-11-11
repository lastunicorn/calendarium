import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { MONTHLY_SPEC } from './options'

describe('monthly migrations', () => {
	const from5 = MONTHLY_SPEC.migrations[5]!

	it('group the 5 calendar fields and the events, keeping the rest', () => {
		const options = {
			year: 2030,
			locale: 'it-IT',
			weekStart: 'auto',
			events: '2030-08-15 Ferragosto\nnot an event',
			title: 'Office',
			showGridLines: false,
		}
		expect(from5(options)).toEqual({
			calendar: { year: 2030, locale: 'it-IT', weekStart: 'auto' },
			events: ['2030-08-15 Ferragosto', 'not an event'],
			title: 'Office',
			showGridLines: false,
		})
		expect(parseOptions(MONTHLY_SPEC, from5(options))).toMatchObject({
			calendar: { year: 2030, locale: 'it-IT', weekStart: 'auto' },
			events: ['2030-08-15 Ferragosto', 'not an event'],
			title: 'Office',
			showGridLines: false,
		})
	})
})
