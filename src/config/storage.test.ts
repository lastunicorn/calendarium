import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { parseConfig } from './storage'

describe('parseConfig', () => {
	it('returns defaults for missing or malformed data', () => {
		expect(parseConfig(null)).toEqual(defaultConfig())
		expect(parseConfig('nope')).toEqual(defaultConfig())
	})

	it('keeps valid fields', () => {
		const stored = {
			year: 2030,
			locale: 'ro-RO',
			weekStart: 0,
			title: 'Family',
			highlightWeekends: false,
		}
		expect(parseConfig(stored)).toEqual(stored)
	})

	it('drops invalid fields', () => {
		const config = parseConfig({ year: 2030.5, locale: 'xx', weekStart: 3, title: 7 })
		const defaults = defaultConfig()
		expect(config.year).toBe(defaults.year)
		expect(config.locale).toBe(defaults.locale)
		expect(config.weekStart).toBe(defaults.weekStart)
		expect(config.title).toBe(defaults.title)
	})
})
