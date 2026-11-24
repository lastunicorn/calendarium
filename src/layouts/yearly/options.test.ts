import { describe, expect, it } from 'vitest'

import { TEST_ENV } from '../../test/environment'
import { parseOptions } from '../LayoutSpec'
import { YEARLY_SPEC } from './options'

describe('yearly options', () => {
	it('start portrait, with one-letter weekdays, the months medium', () => {
		const defaults = YEARLY_SPEC.defaults(TEST_ENV)
		expect(defaults.page.orientation).toBe('portrait')
		expect(defaults.content.weekdayFormat).toBe('narrow')
		expect(defaults.content.monthSize).toBe('medium')
	})

	it('keeps valid fields', () => {
		const options = {
			...YEARLY_SPEC.defaults(TEST_ENV),
			header: { title: 'Family', subtitle: 'Birthdays', fontSize: 40 },
			content: {
				monthSize: 'large',
				weekdayFormat: 'short',
				highlightWeekends: 'off',
				showWeekNumbers: true,
			},
		}
		const ignored: string[] = []
		expect(parseOptions(YEARLY_SPEC, options, TEST_ENV, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields, one by one inside a group', () => {
		const ignored: string[] = []
		const options = {
			header: { title: 7, subtitle: null, fontSize: 8 },
			content: {
				monthSize: 'huge',
				weekdayFormat: 'long',
				highlightWeekends: true,
				showWeekNumbers: 'yes',
			},
		}
		expect(parseOptions(YEARLY_SPEC, options, TEST_ENV, ignored)).toEqual(
			YEARLY_SPEC.defaults(TEST_ENV),
		)
		expect(ignored).toEqual([
			'header.title',
			'header.subtitle',
			'header.fontSize',
			'content.monthSize',
			'content.weekdayFormat',
			'content.highlightWeekends',
			'content.showWeekNumbers',
		])
	})

	it('keeps the small month grids to abbreviated weekday names', () => {
		const parsed = parseOptions(YEARLY_SPEC, { content: { weekdayFormat: 'full' } }, TEST_ENV)
		expect(parsed.content.weekdayFormat).toBe(
			YEARLY_SPEC.defaults(TEST_ENV).content.weekdayFormat,
		)
	})
})
