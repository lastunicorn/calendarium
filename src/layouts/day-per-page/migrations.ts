import type { LayoutMigrations } from '../LayoutSpec'
import { weekendDaysHighlighted } from '../migrations'

/**
 * - 3 to 4: the month grid options and `showMiniMonth` moved under `miniMonth` (`show`), and
 *   `highlightWeekends`, for the heading, became `highlightWeekendDays`, on or off.
 * - 5 to 6: `dayPageLines` became `dayPageFill`, and `squareGridAlignment`, now aligning the
 *   genkō yōshi too, `fillAlignment`.
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
	5: (options) => {
		const { dayPageLines, squareGridAlignment, ...rest } = options
		return { ...rest, dayPageFill: dayPageLines, fillAlignment: squareGridAlignment }
	},
}
