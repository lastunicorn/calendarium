import { weekdayNames } from '../../core/locale'
import type { CalendarModel } from '../common'
import type { MiniMonthPlan } from '../monthGrid'
import type { YearPerPageConfig } from './options'

/** The year's single page. */
export interface YearPage {
	/** The title, or the year when the title is empty. */
	heading: string
	/** The subtitle; hidden when empty. */
	subheading: string
	/** The 12 months, each 6 rows so they line up. */
	months: MiniMonthPlan[]
}

/** The whole year on one page: a heading above a grid of 12 small months. */
export function planYearPage(config: YearPerPageConfig, model: CalendarModel): YearPage {
	const weekdays = weekdayNames(config.locale, model.weekStart, config.weekdayFormat)
	return {
		heading: config.title.trim() || String(config.year),
		subheading: config.subtitle,
		months: model.months.map((month) => ({
			month,
			name: model.monthNames[month.month],
			weekdays,
			highlightWeekends: config.highlightWeekends,
			showWeekNumbers: config.showWeekNumbers,
		})),
	}
}
