import type { LayoutMigrations } from '../LayoutSpec'
import { commonGroups, groupFields } from '../migrations'

/**
 * - 5 to 6: the fields every layout has were grouped (`commonGroups`); `title`,
 *   `monthHeadingAlignment` (now `alignment`) and `headingFontSize` (now `fontSize`) went under
 *   `header`, `adjacentMonths` became `miniMonth`, its fields keeping their names, and the month
 *   grid options (`weekdayFormat`, `highlightWeekends`, `showWeekNumbers`) with
 *   `showAdjacentMonthDays`, `showGridLines`, `weekdayFontSize` and the day number's fields
 *   (`dayNumberFontSize`, `dayNumberHorizontalAlignment`, `dayNumberVerticalAlignment`, now
 *   `dayNumber`'s `fontSize`, `horizontalAlignment` and `verticalAlignment`) under `content`.
 */
export const MONTHLY_MIGRATIONS: LayoutMigrations = {
	5: (options) => {
		const { adjacentMonths, ...renamed } = commonGroups(options)
		if ('adjacentMonths' in options) renamed.miniMonth = adjacentMonths
		const header = groupFields(renamed, 'header', {
			title: 'title',
			monthHeadingAlignment: 'alignment',
			headingFontSize: 'fontSize',
		})
		const dayNumber = groupFields(header, 'dayNumber', {
			dayNumberFontSize: 'fontSize',
			dayNumberHorizontalAlignment: 'horizontalAlignment',
			dayNumberVerticalAlignment: 'verticalAlignment',
		})
		return groupFields(dayNumber, 'content', {
			weekdayFormat: 'weekdayFormat',
			highlightWeekends: 'highlightWeekends',
			showWeekNumbers: 'showWeekNumbers',
			showAdjacentMonthDays: 'showAdjacentMonthDays',
			showGridLines: 'showGridLines',
			weekdayFontSize: 'weekdayFontSize',
			dayNumber: 'dayNumber',
		})
	},
}
