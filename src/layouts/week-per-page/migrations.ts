import type { LayoutMigrations } from '../LayoutSpec'
import { asObject } from '../../core/validation'
import { weekendDaysHighlighted } from '../migrations'

/**
 * - 3 to 4: the month grid options went; `highlightWeekends` became `highlightWeekendDays`, on or
 *   off, and `showWeekNumbers` (the heading's "Week N") `showHeaderWeek`. The new `miniMonth`
 *   starts from its defaults.
 * - 4 to 5: `weekDayDirection` lost `auto`, which became what it drew: `horizontal` (rows) on
 *   portrait paper with one page per week, `vertical` (columns) otherwise.
 */
export const WEEK_PER_PAGE_MIGRATIONS: LayoutMigrations = {
	3: (options) => {
		const { highlightWeekends, showWeekNumbers, ...rest } = options
		return {
			...rest,
			highlightWeekendDays: weekendDaysHighlighted(highlightWeekends),
			showHeaderWeek: showWeekNumbers,
		}
	},
	4: (options) => {
		if (options.weekDayDirection !== 'auto') return options
		const portrait = asObject(options.page)?.orientation === 'portrait'
		const onePage = options.twoPagesPerWeek !== true
		return { ...options, weekDayDirection: portrait && onePage ? 'horizontal' : 'vertical' }
	},
}
