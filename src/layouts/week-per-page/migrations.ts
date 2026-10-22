import type { LayoutMigrations } from '../LayoutSpec'
import { weekendDaysHighlighted } from '../migrations'

/**
 * - 3 to 4: the month grid options went; `highlightWeekends` became `highlightWeekendDays`, on or
 *   off, and `showWeekNumbers` (the heading's "Week N") `showHeaderWeek`. The new `miniMonth`
 *   starts from its defaults.
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
}
