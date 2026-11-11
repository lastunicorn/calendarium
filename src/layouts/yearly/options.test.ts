import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { YEARLY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('yearly options', () => {
	it('start portrait, with one-letter weekdays, the months medium', () => {
		const defaults = YEARLY_SPEC.defaults()
		expect(defaults.page.orientation).toBe('portrait')
		expect(defaults.weekdayFormat).toBe('narrow')
		expect(defaults.monthSize).toBe('medium')
	})

	it('keeps valid fields', () => {
		const options = {
			...YEARLY_SPEC.defaults(),
			...grid,
			title: 'Family',
			subtitle: 'Birthdays',
			headingFontSize: 40,
			monthSize: 'large',
		}
		const ignored: string[] = []
		expect(parseOptions(YEARLY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			weekdayFormat: 'long',
			highlightWeekends: true,
			showWeekNumbers: 'yes',
			title: 7,
			subtitle: null,
			headingFontSize: 8,
			monthSize: 'huge',
		}
		expect(parseOptions(YEARLY_SPEC, options, ignored)).toEqual(YEARLY_SPEC.defaults())
		expect(ignored).toEqual(Object.keys(options))
	})

	it('keeps the small month grids to abbreviated weekday names', () => {
		const parsed = parseOptions(YEARLY_SPEC, { weekdayFormat: 'full' })
		expect(parsed.weekdayFormat).toBe(YEARLY_SPEC.defaults().weekdayFormat)
	})
})
