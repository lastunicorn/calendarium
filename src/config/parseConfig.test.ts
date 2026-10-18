import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { CONFIG_VERSION, parseConfig, toStoredConfig } from './parseConfig'

describe('parseConfig', () => {
	it('returns defaults for missing or malformed data', () => {
		expect(parseConfig(null)).toEqual(defaultConfig())
		expect(parseConfig('nope')).toEqual(defaultConfig())
		expect(parseConfig([])).toEqual(defaultConfig())
	})

	it('keeps valid fields', () => {
		const config = {
			layout: 'year-one-page',
			year: 2030,
			locale: 'ro-RO',
			weekStart: 6,
			weekdayFormat: 'narrow',
			title: 'Family',
			subtitle: 'Birthdays',
			highlightWeekends: 'days',
			showWeekNumbers: true,
			page: {
				paperSize: 'letter',
				orientation: 'landscape',
				margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
			},
		}
		expect(parseConfig({ version: CONFIG_VERSION, ...config })).toEqual(config)
	})

	it('drops invalid fields', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layout: 'month-per-page',
			year: 2030.5,
			locale: 'xx',
			weekStart: 7,
			weekdayFormat: 'long',
			title: 7,
			subtitle: null,
			highlightWeekends: true,
			showWeekNumbers: 'yes',
			page: { paperSize: 'a5', orientation: 'up', margins: 'wide' },
		})
		expect(config).toEqual(defaultConfig())
	})

	it('falls back to the default page when `page` is not an object', () => {
		expect(parseConfig({ version: CONFIG_VERSION, page: 'a4' }).page).toEqual(
			defaultConfig().page,
		)
	})

	it('validates each margin separately', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			page: { margins: { top: 20, right: -1, bottom: 51, left: '5' } },
		})
		expect(config.page.margins).toEqual({ ...defaultConfig().page.margins, top: 20 })
	})

	it('round-trips through toStoredConfig', () => {
		const config = { ...defaultConfig(), year: 2030 }
		config.page = { ...config.page, paperSize: 'a3' }
		expect(parseConfig(toStoredConfig(config))).toEqual(config)
	})

	it('does not copy unknown fields, including the version tag', () => {
		const config = parseConfig({ version: CONFIG_VERSION, extra: 'x', year: 2030 })
		expect(config).not.toHaveProperty('version')
		expect(config).not.toHaveProperty('extra')
	})
})

describe('parseConfig migration', () => {
	// Version 1 kept the page fields at the top level.
	const v1 = {
		year: 2030,
		paperSize: 'letter',
		orientation: 'landscape',
		margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
	}
	const expectedPage = {
		paperSize: 'letter',
		orientation: 'landscape',
		margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
	}

	it('moves version 1 page fields under `page`', () => {
		const config = parseConfig({ version: 1, ...v1 })
		expect(config.year).toBe(2030)
		expect(config.page).toEqual(expectedPage)
		expect(config).not.toHaveProperty('paperSize')
	})

	it('treats data without a version as version 1', () => {
		expect(parseConfig(v1).page).toEqual(expectedPage)
	})

	it('still validates migrated fields', () => {
		const config = parseConfig({ paperSize: 'a5', margins: { top: 20, left: -1 } })
		expect(config.page).toEqual({
			...defaultConfig().page,
			margins: { ...defaultConfig().page.margins, top: 20 },
		})
	})
})
