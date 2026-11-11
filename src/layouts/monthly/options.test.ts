import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { MONTHLY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('monthly options', () => {
	it('start landscape, with full weekday names', () => {
		const defaults = MONTHLY_SPEC.defaults()
		expect(defaults.page.orientation).toBe('landscape')
		expect(defaults.weekdayFormat).toBe('full')
	})

	it('keeps valid fields', () => {
		const options = {
			...MONTHLY_SPEC.defaults(),
			...grid,
			title: 'Office',
			monthHeadingAlignment: 'left',
			headingFontSize: 32,
			showAdjacentMonthDays: false,
			showGridLines: false,
			weekdayFontSize: 11,
			dayNumberFontSize: 20,
			dayNumberHorizontalAlignment: 'center',
			dayNumberVerticalAlignment: 'bottom',
			adjacentMonths: {
				...grid,
				showPreviousMonth: false,
				showNextMonth: true,
				showYear: false,
				size: 'small',
			},
		}
		const ignored: string[] = []
		expect(parseOptions(MONTHLY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			weekdayFormat: 'long',
			highlightWeekends: true,
			showWeekNumbers: 'yes',
			monthHeadingAlignment: 'auto',
			headingFontSize: 60,
			showGridLines: 1,
		}
		expect(parseOptions(MONTHLY_SPEC, options, ignored)).toEqual(MONTHLY_SPEC.defaults())
		expect(ignored).toEqual(Object.keys(options))
	})

	it('keeps full weekday names on the page, but not in the adjacent mini months', () => {
		const defaults = MONTHLY_SPEC.defaults()
		const parsed = parseOptions(MONTHLY_SPEC, {
			weekdayFormat: 'full',
			adjacentMonths: { weekdayFormat: 'full' },
		})
		expect(parsed.weekdayFormat).toBe('full')
		expect(parsed.adjacentMonths.weekdayFormat).toBe(defaults.adjacentMonths.weekdayFormat)
	})
})
