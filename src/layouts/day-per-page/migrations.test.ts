import { describe, expect, it } from 'vitest'
import { parseOptions } from '../LayoutSpec'
import { DAY_PER_PAGE_MIGRATIONS } from './migrations'
import { DAY_PER_PAGE_SPEC } from './options'

describe('day-per-page migrations', () => {
	const from3 = DAY_PER_PAGE_MIGRATIONS[3]!

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
			DAY_PER_PAGE_SPEC,
			from3({ highlightWeekends: 'columns', showMiniMonth: false }),
		)
		expect(parsed).toMatchObject({
			highlightWeekendDays: true,
			miniMonth: {
				...DAY_PER_PAGE_SPEC.defaults().miniMonth,
				highlightWeekends: 'columns',
				show: false,
			},
		})
	})
})
