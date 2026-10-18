import { describe, expect, it } from 'vitest'
import { monthNames, weekdayNames } from './locale'

describe('monthNames', () => {
	it('returns 12 capitalized names', () => {
		expect(monthNames('en-US')[0]).toBe('January')
		expect(monthNames('en-US')[11]).toBe('December')
		expect(monthNames('ro-RO')[0]).toBe('Ianuarie')
	})
})

describe('weekdayNames', () => {
	it('starts on the given week start day', () => {
		expect(weekdayNames('en-US', 1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
		expect(weekdayNames('en-US', 0)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
		expect(weekdayNames('en-US', 6)).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
	})

	it('writes one-letter names in the narrow format', () => {
		expect(weekdayNames('en-US', 1, 'narrow')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
		expect(weekdayNames('ro-RO', 1, 'narrow')).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D'])
	})

	it('strips abbreviation dots', () => {
		expect(weekdayNames('ro-RO', 1)[0]).toBe('Lun')
	})
})
