import { describe, expect, it } from 'vitest'
import { DEFAULTS, defaultAppConfig, LAYOUT_IDS } from './CalendarConfig'
import { CONFIG_VERSION, parseConfig, parseLayoutConfig, toStoredConfig } from './parseConfig'

describe('parseConfig', () => {
	it('returns defaults for missing or malformed data', () => {
		expect(parseConfig(null)).toEqual(defaultAppConfig())
		expect(parseConfig('nope')).toEqual(defaultAppConfig())
		expect(parseConfig([])).toEqual(defaultAppConfig())
		expect(parseConfig({ version: CONFIG_VERSION })).toEqual(defaultAppConfig())
	})

	it('keeps valid fields of every layout', () => {
		const page = {
			paperSize: 'letter',
			orientation: 'landscape',
			margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
		}
		const common = {
			year: 2030,
			locale: 'ro-RO',
			weekStart: 6,
			weekdayFormat: 'narrow',
			highlightWeekends: 'days',
			showWeekNumbers: true,
			page,
		}
		const config = {
			layout: 'month-per-page',
			layouts: {
				'year-per-page': { ...common, title: 'Family', subtitle: 'Birthdays' },
				'month-per-page': { ...common, year: 2031 },
				'day-per-page': {
					...common,
					year: 2032,
					dayPageLines: 'ruled',
					hourFormat: '24h',
					firstHour: 0,
					lastHour: 23,
				},
			},
		}
		expect(parseConfig({ version: CONFIG_VERSION, ...config })).toEqual(config)
	})

	it('drops invalid fields', () => {
		const invalidCommon = {
			year: 2030.5,
			locale: 'xx',
			weekStart: 7,
			weekdayFormat: 'long',
			highlightWeekends: true,
			showWeekNumbers: 'yes',
			page: { paperSize: 'a5', orientation: 'up', margins: 'wide' },
		}
		const config = parseConfig({
			version: CONFIG_VERSION,
			layout: 'week-per-page',
			layouts: {
				'year-per-page': { ...invalidCommon, title: 7, subtitle: null },
				'month-per-page': invalidCommon,
				'day-per-page': {
					...invalidCommon,
					dayPageLines: 'dotted',
					hourFormat: '25h',
					firstHour: 24,
					lastHour: 7.5,
				},
			},
		})
		expect(config).toEqual(defaultAppConfig())
	})

	it('ignores fields a layout does not have', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'month-per-page': { title: 'Office', firstHour: 3 } },
		})
		expect(config.layouts['month-per-page']).not.toHaveProperty('title')
		expect(config.layouts['month-per-page']).not.toHaveProperty('firstHour')
	})

	it('falls back to defaults for one broken layout only', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'year-per-page': 'broken', 'day-per-page': { year: 2040 } },
		})
		expect(config.layouts['year-per-page']).toEqual(DEFAULTS['year-per-page']())
		expect(config.layouts['day-per-page'].year).toBe(2040)
	})

	it('falls back to the default page when `page` is not an object', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'month-per-page': { page: 'a4' } },
		})
		expect(config.layouts['month-per-page'].page).toEqual(DEFAULTS['month-per-page']().page)
	})

	it('validates each margin separately', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: {
				'year-per-page': {
					page: { margins: { top: 20, right: -1, bottom: 51, left: '5' } },
				},
			},
		})
		expect(config.layouts['year-per-page'].page.margins).toEqual({
			...DEFAULTS['year-per-page']().page.margins,
			top: 20,
		})
	})

	it('round-trips through toStoredConfig', () => {
		const config = defaultAppConfig()
		config.layout = 'day-per-page'
		config.layouts['day-per-page'] = { ...config.layouts['day-per-page'], year: 2030 }
		config.layouts['month-per-page'].page = {
			...config.layouts['month-per-page'].page,
			paperSize: 'a3',
		}
		expect(parseConfig(toStoredConfig(config))).toEqual(config)
	})

	it('does not copy unknown fields, including the version tag', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			extra: 'x',
			layouts: { 'year-per-page': { version: 1, extra: 'x' } },
		})
		expect(config).not.toHaveProperty('version')
		expect(config).not.toHaveProperty('extra')
		expect(config.layouts['year-per-page']).not.toHaveProperty('extra')
		expect(config.layouts['year-per-page']).not.toHaveProperty('version')
	})

	it('gives each layout defaults that pass its own validation', () => {
		for (const layout of LAYOUT_IDS) {
			const defaults = DEFAULTS[layout]()
			expect(parseLayoutConfig(layout, { version: CONFIG_VERSION, ...defaults })).toEqual({
				config: defaults,
				ignored: [],
			})
		}
	})

	it('gives the layouts different defaults', () => {
		expect(DEFAULTS['month-per-page']().page.orientation).toBe('landscape')
		expect(DEFAULTS['year-per-page']().page.orientation).toBe('portrait')
	})
})

describe('parseConfig migration', () => {
	const page = {
		paperSize: 'letter',
		orientation: 'landscape',
		margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
	}
	// Version 2 was one flat config shared by every layout.
	const v2 = {
		version: 2,
		layout: 'day-per-page',
		year: 2030,
		locale: 'de-DE',
		title: 'Family',
		subtitle: 'Birthdays',
		firstHour: 6,
		page,
	}

	it('copies a version 2 config into every layout', () => {
		const config = parseConfig(v2)
		expect(config.layout).toBe('day-per-page')
		for (const layout of LAYOUT_IDS) {
			expect(config.layouts[layout]).toMatchObject({ year: 2030, locale: 'de-DE', page })
		}
	})

	it('keeps each version 2 field only on the layouts that have it', () => {
		const { layouts } = parseConfig(v2)
		expect(layouts['year-per-page']).toMatchObject({ title: 'Family', subtitle: 'Birthdays' })
		expect(layouts['month-per-page']).not.toHaveProperty('title')
		expect(layouts['day-per-page']).not.toHaveProperty('title')
		expect(layouts['day-per-page'].firstHour).toBe(6)
	})

	it('keeps layout defaults for fields version 2 did not store', () => {
		const { layouts } = parseConfig({ version: 2, year: 2030 })
		expect(layouts['month-per-page']).toEqual({ ...DEFAULTS['month-per-page'](), year: 2030 })
	})

	// Version 1 kept the page fields at the top level.
	const v1 = {
		year: 2030,
		paperSize: 'letter',
		orientation: 'landscape',
		margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
	}

	it('moves version 1 page fields under `page` in every layout', () => {
		const config = parseConfig({ version: 1, ...v1 })
		for (const layout of LAYOUT_IDS) {
			expect(config.layouts[layout].year).toBe(2030)
			expect(config.layouts[layout].page).toEqual(page)
			expect(config.layouts[layout]).not.toHaveProperty('paperSize')
		}
	})

	it('treats data without a version as version 1', () => {
		expect(parseConfig(v1).layouts['year-per-page'].page).toEqual(page)
	})

	it('renames the old `en-UK` locale to `en-GB`', () => {
		expect(parseConfig({ locale: 'en-UK' }).layouts['day-per-page'].locale).toBe('en-GB')
		expect(
			parseConfig({
				version: CONFIG_VERSION,
				layouts: { 'day-per-page': { locale: 'en-UK' } },
			}).layouts['day-per-page'].locale,
		).toBe('en-GB')
	})

	it('renames the old `year-one-page` layout to `year-per-page`', () => {
		const stored = { layout: 'year-one-page' }
		expect(parseConfig(stored).layout).toBe('year-per-page')
		expect(parseConfig({ version: 2, layout: 'month-per-page' }).layout).toBe('month-per-page')
		expect(parseConfig({ version: CONFIG_VERSION, ...stored }).layout).toBe('year-per-page')
	})

	it('still validates migrated fields', () => {
		const config = parseConfig({ paperSize: 'a5', margins: { top: 20, left: -1 } })
		const defaults = DEFAULTS['month-per-page']().page
		expect(config.layouts['month-per-page'].page).toEqual({
			...defaults,
			margins: { ...defaults.margins, top: 20 },
		})
	})
})
