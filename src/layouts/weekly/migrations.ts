import { asObject } from '../../core/validation'
import type { LayoutMigrations } from '../LayoutSpec'
import {
	commonGroups,
	footerGroup,
	groupFields,
	scheduleGroup,
	weekendDaysHighlighted,
} from '../migrations'

/**
 * - 3 to 4: the month grid options went; `highlightWeekends` became `highlightWeekendDays`, on or
 *   off, and `showWeekNumbers` (the heading's "Week N") `showHeaderWeek`. The new `miniMonth`
 *   starts from its defaults.
 * - 4 to 5: `weekDayDirection` lost `auto`, which became what it drew: `horizontal` (rows) on
 *   portrait paper with one page per week, `vertical` (columns) otherwise.
 * - 5 to 6: the fields every layout has were grouped (`commonGroups`), and the footer's
 *   (`footerGroup`); `headingAlignment`, `headingFontSize` and `showHeaderWeek` went under
 *   `header` (`alignment`, `fontSize`, `showWeek`); `miniMonth.show` became
 *   `miniMonth.showCurrentMonth` and `showNextMonth` joined it; `twoPagesPerWeek` (now
 *   `twoPages`), `startPage`, `weekDayDirection` (now `dayDirection`), `weekdayFormat`,
 *   `highlightWeekendDays`, `weekendDisplay`, `weekPageLines` (now `fill`) and the schedule's
 *   fields (`scheduleGroup`) went under `content`.
 */
export const WEEKLY_MIGRATIONS: LayoutMigrations = {
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
	5: (options) => {
		const grouped = footerGroup(commonGroups(options))
		const miniMonth = asObject(grouped.miniMonth)
		if (miniMonth !== null && 'show' in miniMonth) {
			const { show, ...style } = miniMonth
			grouped.miniMonth = { showCurrentMonth: show, ...style }
		}
		const header = groupFields(grouped, 'header', {
			headingAlignment: 'alignment',
			headingFontSize: 'fontSize',
			showHeaderWeek: 'showWeek',
		})
		const withNextMonth = groupFields(header, 'miniMonth', { showNextMonth: 'showNextMonth' })
		return groupFields(scheduleGroup(withNextMonth), 'content', {
			twoPagesPerWeek: 'twoPages',
			startPage: 'startPage',
			weekDayDirection: 'dayDirection',
			weekdayFormat: 'weekdayFormat',
			highlightWeekendDays: 'highlightWeekendDays',
			weekendDisplay: 'weekendDisplay',
			weekPageLines: 'fill',
			schedule: 'schedule',
		})
	},
}
