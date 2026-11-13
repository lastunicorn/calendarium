import { eventsOfYear } from '../../core/events'
import { dayMonthName, weekdayNames, yearName } from '../../core/locale'
import type { CalendarModel } from '../common'
import { monthEventDays, type MiniMonthPlan } from '../monthGrid'
import { YEAR_PAGE_MESSAGES } from './messages'
import type { YearlyOptions } from './options'

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
	/** The heading's font size, in pt (`header.fontSize`); the event list's keeps its own. */
	headingFontSize: number
	/** The 12 months, each 6 rows so they line up, their days with an event circled. */
	months: MiniMonthPlan[]
	/** The list of the year's events on a page of its own; none when the year has none. */
	eventList?: EventListPage
}

/**
 * The whole year on one page: a heading above a grid of 12 small months, events circled, then the
 * events listed on a second page.
 */
export function planYearPage(options: YearlyOptions, model: CalendarModel): YearPage {
	const { year, locale } = options.calendar
	const { header, content } = options
	const weekdays = weekdayNames(locale, model.weekStart, content.weekdayFormat)
	const heading = header.title.trim() || yearName(locale, year)
	const events = eventsOfYear(model.events, year)
	return {
		heading,
		subheading: header.subtitle,
		headingFontSize: header.fontSize,
		months: model.months.map((month) => ({
			month,
			name: model.monthNames[month.month],
			weekdays,
			highlightWeekends: content.highlightWeekends,
			showWeekNumbers: content.showWeekNumbers,
			eventDays: monthEventDays(model.events, month),
		})),
		eventList:
			events.length > 0
				? {
						heading: YEAR_PAGE_MESSAGES[locale].events,
						subheading: heading,
						events: events.map((event, index) => ({
							key: `${event.date.key}-${index}`,
							date: dayMonthName(locale, event.date),
							name: event.name,
						})),
					}
				: undefined,
	}
}
