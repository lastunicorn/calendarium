import { describe, expect, it } from 'vitest'
import { plainDate } from './calendar'
import { eventNames, eventsOfYear, invalidEventLines, parseEventLine, parseEvents } from './events'

describe('parseEventLine', () => {
	it('reads a date and a name', () => {
		expect(parseEventLine('2026-04-05 Easter')).toEqual({
			year: 2026,
			month: 3,
			day: 5,
			name: 'Easter',
		})
		expect(parseEventLine('  2026-04-05   Easter Sunday  ')?.name).toBe('Easter Sunday')
	})

	it('reads the year 0000 as every year, where February 29 is a date', () => {
		expect(parseEventLine('0000-12-25 Christmas')).toEqual({
			year: undefined,
			month: 11,
			day: 25,
			name: 'Christmas',
		})
		expect(parseEventLine('0000-02-29 Leap day')?.day).toBe(29)
	})

	it('rejects a line without a valid date and a name', () => {
		expect(parseEventLine('2026-04-05')).toBeUndefined()
		expect(parseEventLine('2026-04-05   ')).toBeUndefined()
		expect(parseEventLine('2026-4-5 Easter')).toBeUndefined()
		expect(parseEventLine('2026-13-01 Nope')).toBeUndefined()
		expect(parseEventLine('2026-00-01 Nope')).toBeUndefined()
		expect(parseEventLine('2026-04-31 Nope')).toBeUndefined()
		expect(parseEventLine('2025-02-29 Nope')).toBeUndefined()
		expect(parseEventLine('Easter 2026-04-05')).toBeUndefined()
	})
})

describe('parseEvents', () => {
	it('reads one event per line, skipping blank and invalid ones', () => {
		const events = parseEvents('0000-01-01 New Year\r\n\n  \nnope\n2026-04-05 Easter\n')
		expect(events.map((event) => event.name)).toEqual(['New Year', 'Easter'])
	})
})

describe('invalidEventLines', () => {
	it('numbers the lines that are neither blank nor an event', () => {
		expect(invalidEventLines('0000-01-01 New Year\n\nnope\n2026-02-30 Nope')).toEqual([3, 4])
		expect(invalidEventLines('')).toEqual([])
	})
})

describe('eventNames', () => {
	const events = parseEvents('0000-01-01 New Year\n2026-01-01 Holiday\n2027-01-01 Later')

	it('names a date’s events in the list’s order, yearly ones every year', () => {
		expect(eventNames(events, plainDate(2026, 0, 1))).toEqual(['New Year', 'Holiday'])
		expect(eventNames(events, plainDate(2028, 0, 1))).toEqual(['New Year'])
		expect(eventNames(events, plainDate(2026, 0, 2))).toEqual([])
	})
})

describe('eventsOfYear', () => {
	const events = parseEvents(
		'2026-03-01 Trip\n0000-01-20 Birthday\n2027-01-07 Next year\n0000-02-29 Leap day\n2026-01-20 Party',
	)

	it('lists the year’s events by date, those on one date in the list’s order', () => {
		expect(eventsOfYear(events, 2026).map((event) => [event.date.key, event.name])).toEqual([
			['2026-01-20', 'Birthday'],
			['2026-01-20', 'Party'],
			['2026-03-01', 'Trip'],
		])
	})

	it('lists a yearly February 29 in leap years only', () => {
		expect(eventsOfYear(events, 2028).map((event) => event.name)).toEqual([
			'Birthday',
			'Leap day',
		])
	})
})
