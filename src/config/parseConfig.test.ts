import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { CONFIG_VERSION, parseConfig, toStoredConfig } from './parseConfig'

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
			margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
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
			margins: 'wide',
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
		expect(config.margins).toEqual(defaults.margins)
	})

	it('reads data with and without a version tag', () => {
		const config = { ...defaultConfig(), year: 2030 }
		expect(parseConfig(toStoredConfig(config))).toEqual(config)
		expect(parseConfig({ ...config })).toEqual(config)
	})

	it('does not copy unknown fields, including the version tag', () => {
		const config = parseConfig({ version: CONFIG_VERSION, extra: 'x', year: 2030 })
		expect(config).not.toHaveProperty('version')
		expect(config).not.toHaveProperty('extra')
	})

	it('validates each margin separately', () => {
		const config = parseConfig({ margins: { top: 20, right: -1, bottom: 51, left: '5' } })
		expect(config.margins).toEqual({ ...defaultConfig().margins, top: 20 })
	})
})
