import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { DAILY_MIGRATIONS } from './migrations'
import { DAILY_SPEC } from './options'

describe('daily migrations', () => {
	const from3 = DAILY_MIGRATIONS[3]!
	const from5 = DAILY_MIGRATIONS[5]!

	it('move the 3 month grid options under the mini month', () => {
		const options = {
			year: 2030,
			weekdayFormat: 'short',
			highlightWeekends: 'off',
			showWeekNumbers: true,
			showMiniMonth: false,
		}
		expect(from3(options)).toEqual({
			year: 2030,
			highlightWeekendDays: false,
			miniMonth: {
				show: false,
				weekdayFormat: 'short',
				highlightWeekends: 'off',
				showWeekNumbers: true,
			},
		})
	})

	it('give options that parse, keeping the mini month’s other defaults', () => {
		const parsed = parseOptions(
			DAILY_SPEC,
			from3({ highlightWeekends: 'columns', showMiniMonth: false }),
		)
		expect(parsed).toMatchObject({
			highlightWeekendDays: true,
			miniMonth: {
				...DAILY_SPEC.defaults().miniMonth,
				highlightWeekends: 'columns',
				show: false,
			},
		})
	})

	it('rename the 5 fill and its alignment', () => {
		const options = { year: 2030, dayPageLines: 'dots', squareGridAlignment: 'right' }
		expect(from5(options)).toEqual({
			calendar: { year: 2030 },
			dayPageFill: 'dots',
			fillAlignment: 'right',
		})
		expect(parseOptions(DAILY_SPEC, from5(options))).toMatchObject({
			dayPageFill: 'dots',
			fillAlignment: 'right',
		})
	})
})

describe('daily migrations from 5, the groups', () => {
	const from5 = DAILY_MIGRATIONS[5]!

	it('group the calendar fields, the events and the footer along with the renames', () => {
		const options = {
			year: 2030,
			locale: 'ja-JP',
			weekStart: 0,
			events: '0000-01-01 元日',
			showFooter: true,
			footerHeight: 35,
			dayPageLines: 'ruled',
			squareGridAlignment: 'left',
			ruledLineSpacing: 7,
		}
		expect(from5(options)).toEqual({
			calendar: { year: 2030, locale: 'ja-JP', weekStart: 0 },
			events: ['0000-01-01 元日'],
			footer: { show: true, height: 35 },
			dayPageFill: 'ruled',
			fillAlignment: 'left',
			ruledLineSpacing: 7,
		})
		expect(parseOptions(DAILY_SPEC, from5(options))).toMatchObject({
			calendar: { year: 2030, locale: 'ja-JP', weekStart: 0 },
			events: ['0000-01-01 元日'],
			footer: { show: true, height: 35 },
			dayPageFill: 'ruled',
			fillAlignment: 'left',
			ruledLineSpacing: 7,
		})
	})
})
