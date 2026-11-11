import type { LayoutMigrations } from '../LayoutSpec'
import {
	commonGroups,
	footerGroup,
	groupFields,
	scheduleGroup,
	weekendDaysHighlighted,
} from '../migrations'

/**
 * - 3 to 4: the month grid options and `showMiniMonth` moved under `miniMonth` (`show`), and
 *   `highlightWeekends`, for the heading, became `highlightWeekendDays`, on or off.
 * - 5 to 6: the fields every layout has were grouped (`commonGroups`), and the footer's
 *   (`footerGroup`); `dayPageTitle` (now `heading`), `headingFontSize` (now `fontSize`),
 *   `showHeaderWeek` (now `showWeek`), `showHeaderDayOfYear` (now `showDayOfYear`) and
 *   `highlightWeekendDays`, which colors the heading, went under `header`; `twoPagesPerDay` (now
 *   `twoPages`), `dayPageLines` (now `fill`), `ruledLineSpacing`, `squareSize`,
 *   `squareGridAlignment` (now `fillAlignment`, aligning the genkō yōshi too) and the schedule's
 *   fields (`scheduleGroup`) under `content`. The 6 development builds' names of the fill and its
 *   alignment, `dayPageFill` and `fillAlignment`, are read too.
 */
export const DAILY_MIGRATIONS: LayoutMigrations = {
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
		const header = groupFields(footerGroup(commonGroups(options)), 'header', {
			dayPageTitle: 'heading',
			headingFontSize: 'fontSize',
			showHeaderWeek: 'showWeek',
			showHeaderDayOfYear: 'showDayOfYear',
			highlightWeekendDays: 'highlightWeekendDays',
		})
		return groupFields(scheduleGroup(header), 'content', {
			twoPagesPerDay: 'twoPages',
			dayPageLines: 'fill',
			dayPageFill: 'fill',
			ruledLineSpacing: 'ruledLineSpacing',
			squareSize: 'squareSize',
			squareGridAlignment: 'fillAlignment',
			fillAlignment: 'fillAlignment',
			schedule: 'schedule',
		})
	},
}
