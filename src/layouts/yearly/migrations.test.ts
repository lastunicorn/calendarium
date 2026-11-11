import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { YEARLY_SPEC } from './options'

describe('yearly migrations', () => {
	const from5 = YEARLY_SPEC.migrations[5]!

	it('group the 5 calendar fields and the events, keeping the rest', () => {
		const options = {
			year: 2030,
			locale: 'fr-FR',
			weekStart: 1,
			events: '0000-07-14 Fête nationale',
			title: 'Ours',
			monthSize: 'large',
		}
		expect(from5(options)).toEqual({
			calendar: { year: 2030, locale: 'fr-FR', weekStart: 1 },
			events: ['0000-07-14 Fête nationale'],
			title: 'Ours',
			monthSize: 'large',
		})
		expect(parseOptions(YEARLY_SPEC, from5(options))).toMatchObject({
			calendar: { year: 2030, locale: 'fr-FR', weekStart: 1 },
			events: ['0000-07-14 Fête nationale'],
			title: 'Ours',
			monthSize: 'large',
		})
	})
})
