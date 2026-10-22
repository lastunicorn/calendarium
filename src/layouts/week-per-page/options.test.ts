import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { WEEK_PER_PAGE_SPEC } from './options'

const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }

describe('week-per-page options', () => {
	it('start landscape', () => {
		expect(WEEK_PER_PAGE_SPEC.defaults().page.orientation).toBe('landscape')
	})

	it('keeps valid fields', () => {
		const options = {
			...WEEK_PER_PAGE_SPEC.defaults(),
			weekdayFormat: 'narrow',
			highlightWeekendDays: false,
			showHeaderWeek: false,
			headingAlignment: 'right',
			headingFontSize: 32,
			weekendDisplay: 'reduced',
			weekPageLines: 'hours',
			twoPagesPerWeek: true,
			startPage: 'even',
			weekDayDirection: 'horizontal',
			showFooter: true,
			footerHeight: 42,
			hourFormat: '12h',
			firstHour: 8,
			lastHour: 18,
			miniMonth: { ...grid, show: true, showYear: true },
		}
		const ignored: string[] = []
		expect(parseOptions(WEEK_PER_PAGE_SPEC, options, ignored)).toEqual(options)
		expect(ignored).toEqual([])
	})

	it('drops invalid fields', () => {
		const ignored: string[] = []
		const options = {
			weekdayFormat: 'long',
			highlightWeekendDays: 'days',
			showHeaderWeek: 'yes',
			weekendDisplay: 'off',
			weekPageLines: 'ruled',
			twoPagesPerWeek: 0,
			weekDayDirection: 'diagonal',
			hourFormat: 12,
			firstHour: -1,
			lastHour: '21',
		}
		expect(parseOptions(WEEK_PER_PAGE_SPEC, options, ignored)).toEqual(
			WEEK_PER_PAGE_SPEC.defaults(),
		)
		expect(ignored).toEqual(Object.keys(options))
	})

	it('keeps full weekday names on the page, but not in the mini month', () => {
		const defaults = WEEK_PER_PAGE_SPEC.defaults()
		const parsed = parseOptions(WEEK_PER_PAGE_SPEC, {
			weekdayFormat: 'full',
			miniMonth: { weekdayFormat: 'full' },
		})
		expect(parsed.weekdayFormat).toBe('full')
		expect(parsed.miniMonth.weekdayFormat).toBe(defaults.miniMonth.weekdayFormat)
	})

	it('puts a reversed schedule in order', () => {
		const config = { ...WEEK_PER_PAGE_SPEC.defaults(), firstHour: 18, lastHour: 9 }
		expect(WEEK_PER_PAGE_SPEC.normalize(config)).toMatchObject({ firstHour: 9, lastHour: 18 })
		expect(parseOptions(WEEK_PER_PAGE_SPEC, { firstHour: 22, lastHour: 6 })).toMatchObject({
			firstHour: 6,
			lastHour: 22,
		})
	})
})
