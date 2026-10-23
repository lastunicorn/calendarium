import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { YEAR_PER_PAGE_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('year-per-page options', () => {
	it('start portrait, with one-letter weekdays, the months medium', () => {
		const defaults = YEAR_PER_PAGE_SPEC.defaults()
		expect(defaults.page.orientation).toBe('portrait')
		expect(defaults.weekdayFormat).toBe('narrow')
		expect(defaults.monthSize).toBe('medium')
	})

	it('keeps valid fields', () => {
		const options = {
			...YEAR_PER_PAGE_SPEC.defaults(),
			...grid,
			title: 'Family',
			subtitle: 'Birthdays',
			monthSize: 'large',
		}
		const ignored: string[] = []
		expect(parseOptions(YEAR_PER_PAGE_SPEC, options, ignored)).toEqual(options)
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
			monthSize: 'huge',
		}
		expect(parseOptions(YEAR_PER_PAGE_SPEC, options, ignored)).toEqual(
			YEAR_PER_PAGE_SPEC.defaults(),
		)
		expect(ignored).toEqual(Object.keys(options))
	})

	it('keeps the small month grids to abbreviated weekday names', () => {
		const parsed = parseOptions(YEAR_PER_PAGE_SPEC, { weekdayFormat: 'full' })
		expect(parsed.weekdayFormat).toBe(YEAR_PER_PAGE_SPEC.defaults().weekdayFormat)
	})
})
