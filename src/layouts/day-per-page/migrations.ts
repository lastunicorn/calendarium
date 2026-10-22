import type { LayoutMigrations } from '../LayoutSpec'
import { weekendDaysHighlighted } from '../migrations'

/**
 * - 3 to 4: the month grid options and `showMiniMonth` moved under `miniMonth` (`show`), and
 *   `highlightWeekends`, for the heading, became `highlightWeekendDays`, on or off.
 */
export const DAY_PER_PAGE_MIGRATIONS: LayoutMigrations = {
	3: (options) => {
		const { showMiniMonth, weekdayFormat, highlightWeekends, showWeekNumbers, ...rest } =
			options
		return {
			...rest,
			highlightWeekendDays: weekendDaysHighlighted(highlightWeekends),
			miniMonth: { show: showMiniMonth, weekdayFormat, highlightWeekends, showWeekNumbers },
		}
	},
}
