import { describe, expect, it } from 'vitest'

import { parseOptions } from '../LayoutSpec'
import { MONTHLY_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('monthly options', () => {
	it('start landscape, with full weekday names', () => {
		const defaults = MONTHLY_SPEC.defaults()
		expect(defaults.page.orientation).toBe('landscape')
		expect(defaults.content.weekdayFormat).toBe('full')
	})

	it('keeps valid fields', () => {
		const options = {
			...MONTHLY_SPEC.defaults(),
			header: { title: 'Office', alignment: 'left', fontSize: 32 },
			miniMonth: {
				showPreviousMonth: false,
				showNextMonth: true,
				showYear: false,
				size: 'small',
				...grid,
			},
			content: {
				...grid,
				showAdjacentMonthDays: false,
				showGridLines: false,
				weekdayFontSize: 11,
				dayNumber: {
					fontSize: 20,
					horizontalAlignment: 'center',
					verticalAlignment: 'bottom',
				},
			},
		}
		const ignored: string[] = []
		expect(parseOptions(MONTHLY_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			header: { alignment: 'auto', fontSize: 60 },
			content: {
				weekdayFormat: 'long',
				highlightWeekends: true,
				showWeekNumbers: 'yes',
				showGridLines: 1,
				dayNumber: { fontSize: 60, horizontalAlignment: 'top' },
			},
		}
		expect(parseOptions(MONTHLY_SPEC, options, ignored)).toEqual(MONTHLY_SPEC.defaults())
		expect(ignored).toEqual([
			'header.alignment',
			'header.fontSize',
			'content.weekdayFormat',
			'content.highlightWeekends',
			'content.showWeekNumbers',
			'content.showGridLines',
			'content.dayNumber.fontSize',
			'content.dayNumber.horizontalAlignment',
		])
	})

	it('keeps full weekday names on the page, but not in the mini months', () => {
		const defaults = MONTHLY_SPEC.defaults()
		const parsed = parseOptions(MONTHLY_SPEC, {
			content: { weekdayFormat: 'full' },
			miniMonth: { weekdayFormat: 'full' },
		})
		expect(parsed.content.weekdayFormat).toBe('full')
		expect(parsed.miniMonth.weekdayFormat).toBe(defaults.miniMonth.weekdayFormat)
	})
})
