import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { parseConfig, parseConfigFile, serializeConfig } from './storage'

describe('parseConfig', () => {
	it('returns defaults for missing or malformed data', () => {
		expect(parseConfig(null)).toEqual(defaultConfig())
		expect(parseConfig('nope')).toEqual(defaultConfig())
	})

	it('keeps valid fields', () => {
		const stored = {
			year: 2030,
			locale: 'ro-RO',
			weekStart: 6,
			weekdayFormat: 'narrow',
			title: 'Family',
			subtitle: 'Birthdays',
			highlightWeekends: 'days',
			showWeekNumbers: true,
			paperSize: 'letter',
			orientation: 'landscape',
		}
		expect(parseConfig(stored)).toEqual(stored)
	})

	it('drops invalid fields', () => {
		const config = parseConfig({
			year: 2030.5,
			locale: 'xx',
			weekStart: 7,
			weekdayFormat: 'long',
			title: 7,
			subtitle: null,
			highlightWeekends: true,
			showWeekNumbers: 'yes',
			paperSize: 'a5',
			orientation: 'up',
		})
		const defaults = defaultConfig()
		expect(config.year).toBe(defaults.year)
		expect(config.locale).toBe(defaults.locale)
		expect(config.weekStart).toBe(defaults.weekStart)
		expect(config.weekdayFormat).toBe(defaults.weekdayFormat)
		expect(config.title).toBe(defaults.title)
		expect(config.subtitle).toBe(defaults.subtitle)
		expect(config.highlightWeekends).toBe(defaults.highlightWeekends)
		expect(config.showWeekNumbers).toBe(defaults.showWeekNumbers)
		expect(config.paperSize).toBe(defaults.paperSize)
		expect(config.orientation).toBe(defaults.orientation)
	})
})

describe('config files', () => {
	it('round-trips through serializeConfig', () => {
		const config = { ...defaultConfig(), year: 2031, title: 'Office', paperSize: 'a3' as const }
		expect(parseConfigFile(serializeConfig(config))).toEqual(config)
	})

	it('rejects files that are not a JSON object', () => {
		expect(parseConfigFile('not json')).toBeNull()
		expect(parseConfigFile('[]')).toBeNull()
		expect(parseConfigFile('null')).toBeNull()
		expect(parseConfigFile('2030')).toBeNull()
	})

	it('falls back to defaults for invalid fields', () => {
		expect(parseConfigFile('{"year": 2030, "orientation": "up"}')).toEqual({
			...defaultConfig(),
			year: 2030,
		})
	})
})
