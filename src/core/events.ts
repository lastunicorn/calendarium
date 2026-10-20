import { daysInMonth, type PlainDate } from './calendar'

/** A named day: on one date, or every year on the same month and day. */
export interface CalendarEvent {
	/** The year it happens in, or `undefined` for every year (written `0000`). */
	year?: number
	/** 0 = January … 11 = December. */
	month: number
	/** Day of the month, 1–31. */
	day: number
	name: string
}

/** The year written for an event that happens every year. */
export const EVERY_YEAR = 0

/** A line of the event list: `YYYY-MM-DD`, then the name after a space. */
const EVENT_LINE = /^(\d{4})-(\d{2})-(\d{2})\s+(\S.*)$/

/**
 * The event a line of the list describes, or `undefined` when it doesn't hold a valid date and a
 * name. A yearly event may fall on February 29, which it marks in leap years only.
 */
export function parseEventLine(line: string): CalendarEvent | undefined {
	const match = EVENT_LINE.exec(line.trim())
	if (!match) return undefined
	const [, yearText, monthText, dayText, name] = match
	const year = Number(yearText)
	const month = Number(monthText) - 1
	const day = Number(dayText)
	// A leap year (2000) stands for every year, so February 29 is allowed.
	const days =
		month >= 0 && month < 12 ? daysInMonth(year === EVERY_YEAR ? 2000 : year, month) : 0
	if (day < 1 || day > days) return undefined
	return { year: year === EVERY_YEAR ? undefined : year, month, day, name: name.trim() }
}

/** The numbers (from 1) of the lines of `text` that are neither blank nor an event. */
export function invalidEventLines(text: string): number[] {
	return text
		.split('\n')
		.flatMap((line, index) =>
			line.trim() !== '' && parseEventLine(line) === undefined ? [index + 1] : [],
		)
}

/** The events of a list written one per line, in order; blank and invalid lines are skipped. */
export function parseEvents(text: string): CalendarEvent[] {
	return text.split('\n').flatMap((line) => parseEventLine(line) ?? [])
}

/** The names of the events on `date`, in the list's order. */
export function eventNames(events: readonly CalendarEvent[], date: PlainDate): string[] {
	return events
		.filter(
			(event) =>
				event.day === date.day &&
				event.month === date.month &&
				(event.year === undefined || event.year === date.year),
		)
		.map((event) => event.name)
}
