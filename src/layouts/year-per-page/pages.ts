import { eventNames, eventsOfYear } from '../../core/events'
import { dayMonthName, weekdayNames, yearName } from '../../core/locale'
import { PRINT_MESSAGES } from '../../core/messages'
import type { CalendarModel } from '../common'
import type { MiniMonthPlan } from '../monthGrid'
import type { YearPerPageConfig } from './options'

/** One line of the year's list of events. */
export interface EventListItem {
	/** Unique in the list, for the React key. */
	key: string
	/** The day and month, e.g. "January 20". */
	date: string
	name: string
}

/** The page after the year's, listing its events. */
export interface EventListPage {
	/** "Events", in the calendar's language. */
	heading: string
	/** The year page's heading. */
	subheading: string
	/** The year's events by date. */
	events: EventListItem[]
}

/** The year's page, followed by the list of its events when it has any. */
export interface YearPage {
	/** The title, or the year, e.g. "2026", "2026年", when the title is empty. */
	heading: string
	/** The subtitle; hidden when empty. */
	subheading: string
	/** The 12 months, each 6 rows so they line up, their days with an event circled. */
	months: MiniMonthPlan[]
	/** The list of the year's events on a page of its own; none when the year has none. */
	eventList?: EventListPage
}

/**
 * The whole year on one page: a heading above a grid of 12 small months, events circled, then the
 * events listed on a second page.
 */
export function planYearPage(config: YearPerPageConfig, model: CalendarModel): YearPage {
	const weekdays = weekdayNames(config.locale, model.weekStart, config.weekdayFormat)
	const heading = config.title.trim() || yearName(config.locale, config.year)
	const events = eventsOfYear(model.events, config.year)
	return {
		heading,
		subheading: config.subtitle,
		months: model.months.map((month) => ({
			month,
			name: model.monthNames[month.month],
			weekdays,
			highlightWeekends: config.highlightWeekends,
			showWeekNumbers: config.showWeekNumbers,
			eventDays: month.weeks
				.flat()
				.filter((day) => day.inMonth && eventNames(model.events, day).length > 0)
				.map((day) => day.day),
		})),
		eventList:
			events.length > 0
				? {
						heading: PRINT_MESSAGES[config.locale].events,
						subheading: heading,
						events: events.map((event, index) => ({
							key: `${event.date.key}-${index}`,
							date: dayMonthName(config.locale, event.date),
							name: event.name,
						})),
					}
				: undefined,
	}
}
