import type { LayoutMigrations } from '../LayoutSpec'
import { commonGroups, groupFields } from '../migrations'

/**
 * - 5 to 6: the fields every layout has were grouped (`commonGroups`); `title`, `subtitle` and
 *   `headingFontSize` (now `fontSize`) went under `header`, and `monthSize` with the month grid
 *   options (`weekdayFormat`, `highlightWeekends`, `showWeekNumbers`) under `content`.
 */
export const YEARLY_MIGRATIONS: LayoutMigrations = {
	5: (options) => {
		const header = groupFields(commonGroups(options), 'header', {
			title: 'title',
			subtitle: 'subtitle',
			headingFontSize: 'fontSize',
		})
		return groupFields(header, 'content', {
			monthSize: 'monthSize',
			weekdayFormat: 'weekdayFormat',
			highlightWeekends: 'highlightWeekends',
			showWeekNumbers: 'showWeekNumbers',
		})
	},
}
