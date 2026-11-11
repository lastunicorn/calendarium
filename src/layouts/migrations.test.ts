import { describe, expect, it } from 'vitest'
import { commonGroups, footerGroup, groupFields, weekendDaysHighlighted } from './migrations'

describe('groupFields', () => {
	it('moves the named flat fields into the group, under their new names', () => {
		const options = { a: 1, b: 'x', c: true }
		expect(groupFields(options, 'group', { a: 'a', b: 'renamed' })).toEqual({
			c: true,
			group: { a: 1, renamed: 'x' },
		})
		expect(options).toEqual({ a: 1, b: 'x', c: true })
	})

	it('leaves out a field the options lack, and adds no group when none is there', () => {
		expect(groupFields({ a: 1 }, 'group', { b: 'b' })).toEqual({ a: 1 })
		expect(groupFields({ a: 1, b: undefined }, 'group', { b: 'b' })).toEqual({
			a: 1,
			group: { b: undefined },
		})
	})

	it('adds to a group the options already have', () => {
		expect(groupFields({ a: 1, group: { z: 0 } }, 'group', { a: 'a' })).toEqual({
			group: { z: 0, a: 1 },
		})
		expect(groupFields({ group: 'broken' }, 'group', { a: 'a' })).toEqual({ group: 'broken' })
	})
})

describe('commonGroups', () => {
	it('groups the calendar fields and splits the events into lines', () => {
		const options = {
			year: 2030,
			locale: 'de-DE',
			weekStart: 0,
			events: '0000-01-01 New Year\n\n2030-04-21 Easter',
			page: { paperSize: 'a5' },
			title: 'Ours',
		}
		expect(commonGroups(options)).toEqual({
			calendar: { year: 2030, locale: 'de-DE', weekStart: 0 },
			events: ['0000-01-01 New Year', '', '2030-04-21 Easter'],
			page: { paperSize: 'a5' },
			title: 'Ours',
		})
	})

	it('turns an empty event list into no lines', () => {
		expect(commonGroups({ events: '' })).toEqual({ events: [] })
	})

	it('moves only the fields there are, and keeps events that are not text as they are', () => {
		expect(commonGroups({ year: 2030 })).toEqual({ calendar: { year: 2030 } })
		expect(commonGroups({ events: 42 })).toEqual({ events: 42 })
		expect(commonGroups({ title: 'Ours' })).toEqual({ title: 'Ours' })
	})
})

describe('footerGroup', () => {
	it('groups the footer fields under their new names', () => {
		expect(footerGroup({ showFooter: true, footerHeight: 35, year: 2030 })).toEqual({
			footer: { show: true, height: 35 },
			year: 2030,
		})
		expect(footerGroup({ year: 2030 })).toEqual({ year: 2030 })
	})
})

describe('weekendDaysHighlighted', () => {
	it('turns a 3 highlight into on or off, keeping any other value', () => {
		expect(weekendDaysHighlighted('off')).toBe(false)
		expect(weekendDaysHighlighted('days')).toBe(true)
		expect(weekendDaysHighlighted('columns')).toBe(true)
		expect(weekendDaysHighlighted('always')).toBe('always')
	})
})
