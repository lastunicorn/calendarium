import { describe, expect, it } from 'vitest'
import { defaultLayoutConfig, LAYOUT_IDS } from '../layouts'
import { defaultAppConfig } from './AppConfig'
import { parseConfig, parseLayoutConfig, toStoredConfig } from './parseConfig'
import { CONFIG_VERSION } from './version'

describe('parseConfig', () => {
	it('keeps a language-chosen week start', () => {
		const stored = toStoredConfig(defaultAppConfig())
		stored.layouts['month-per-page'] = {
			...stored.layouts['month-per-page'],
			weekStart: 'auto',
		}
		stored.layouts['day-per-page'] = { ...stored.layouts['day-per-page'], weekStart: 0 }
		const { layouts } = parseConfig(stored)
		expect(layouts['month-per-page'].weekStart).toBe('auto')
		expect(layouts['day-per-page'].weekStart).toBe(0)
	})

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
			mirrorMargins: true,
		}
		const common = {
			year: 2030,
			locale: 'ro-RO',
			weekStart: 6,
			page,
		}
		const grid = { weekdayFormat: 'short', highlightWeekends: 'off', showWeekNumbers: true }
		const config = {
			layout: 'month-per-page',
			layouts: {
				'year-per-page': { ...common, ...grid, title: 'Family', subtitle: 'Birthdays' },
				'month-per-page': { ...common, ...grid, year: 2031 },
				'week-per-page': {
					...common,
					year: 2033,
					weekdayFormat: 'narrow',
					highlightWeekendDays: false,
					showHeaderWeek: false,
					weekendDisplay: 'reduced',
					weekPageLines: 'hours',
					twoPagesPerWeek: true,
					weekDayDirection: 'horizontal',
					hourFormat: '12h',
					firstHour: 8,
					lastHour: 18,
					miniMonth: { ...grid, show: true },
				},
				'day-per-page': {
					...common,
					year: 2032,
					dayPageTitle: 'date',
					dayPageLines: 'ruled',
					twoPagesPerDay: true,
					hourFormat: '24h',
					firstHour: 0,
					lastHour: 23,
					highlightWeekendDays: false,
					miniMonth: { ...grid, show: false, highlightWeekends: 'columns' },
					showHeaderWeek: false,
					showHeaderDayOfYear: false,
				},
			},
		}
		expect(parseConfig({ version: CONFIG_VERSION, ...config })).toEqual(config)
	})

	it('reads the week and day options of a 3.x config', () => {
		const config = parseConfig({
			version: 3,
			layouts: {
				'week-per-page': { highlightWeekends: 'off', showWeekNumbers: false },
				'day-per-page': { highlightWeekends: 'columns', showMiniMonth: false },
			},
		})
		expect(config.layouts['week-per-page']).toMatchObject({
			highlightWeekendDays: false,
			showHeaderWeek: false,
		})
		expect(config.layouts['day-per-page']).toMatchObject({
			highlightWeekendDays: true,
			miniMonth: {
				...defaultLayoutConfig('day-per-page').miniMonth,
				highlightWeekends: 'columns',
				show: false,
			},
		})
	})

	it('drops invalid fields', () => {
		const invalidCommon = {
			year: 2030.5,
			locale: 'xx',
			weekStart: 7,
			page: { paperSize: 'b5', orientation: 'up', margins: 'wide' },
		}
		const invalidGrid = {
			weekdayFormat: 'long',
			highlightWeekends: true,
			showWeekNumbers: 'yes',
		}
		const config = parseConfig({
			version: CONFIG_VERSION,
			layout: 'quarter-per-page',
			layouts: {
				'year-per-page': { ...invalidCommon, ...invalidGrid, title: 7, subtitle: null },
				'month-per-page': { ...invalidCommon, ...invalidGrid },
				'week-per-page': {
					...invalidCommon,
					weekdayFormat: 'long',
					highlightWeekendDays: 'days',
					showHeaderWeek: 'yes',
					weekendDisplay: 'off',
					weekPageLines: 'ruled',
					twoPagesPerWeek: 0,
					weekDayDirection: 'diagonal',
					hourFormat: 12,
					firstHour: -1,
					lastHour: '21',
				},
				'day-per-page': {
					...invalidCommon,
					dayPageTitle: 'month',
					dayPageLines: 'dotted',
					twoPagesPerDay: 'yes',
					hourFormat: '25h',
					firstHour: 24,
					lastHour: 7.5,
					highlightWeekendDays: 'yes',
					miniMonth: { ...invalidGrid, show: 'no' },
					showHeaderWeek: 1,
					showHeaderDayOfYear: null,
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
		expect(config.layouts['year-per-page']).toEqual(defaultLayoutConfig('year-per-page'))
		expect(config.layouts['day-per-page'].year).toBe(2040)
	})

	it('falls back to the default page when `page` is not an object', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'month-per-page': { page: 'a4' } },
		})
		expect(config.layouts['month-per-page'].page).toEqual(
			defaultLayoutConfig('month-per-page').page,
		)
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
			...defaultLayoutConfig('year-per-page').page.margins,
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

	it('does not copy unknown fields, including the version tags', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			app: '3.0.0',
			extra: 'x',
			layouts: { 'year-per-page': { version: CONFIG_VERSION, app: '3.0.0', extra: 'x' } },
		})
		expect(config).not.toHaveProperty('version')
		expect(config).not.toHaveProperty('app')
		expect(config).not.toHaveProperty('extra')
		expect(config.layouts['year-per-page']).not.toHaveProperty('extra')
		expect(config.layouts['year-per-page']).not.toHaveProperty('version')
		expect(config.layouts['year-per-page']).not.toHaveProperty('app')
	})

	it('gives each layout defaults that pass its own validation', () => {
		for (const layout of LAYOUT_IDS) {
			const defaults = defaultLayoutConfig(layout)
			expect(parseLayoutConfig(layout, defaults)).toEqual({
				config: defaults,
				ignored: [],
			})
		}
	})

	it('gives the layouts different defaults', () => {
		expect(defaultLayoutConfig('month-per-page').page.orientation).toBe('landscape')
		expect(defaultLayoutConfig('year-per-page').page.orientation).toBe('portrait')
	})
})

describe('parseConfig versions', () => {
	it('ignores data without a version this app knows', () => {
		const layouts = { 'year-per-page': { year: 2040 } }
		for (const version of [undefined, 1, 2, '3', 3.5]) {
			expect(parseConfig({ version, layout: 'day-per-page', layouts })).toEqual(
				defaultAppConfig(),
			)
		}
	})

	it('reads data from a later version as the current shape', () => {
		const config = parseConfig({
			version: CONFIG_VERSION + 1,
			layout: 'day-per-page',
			layouts: { 'day-per-page': { year: 2040, futureOption: true } },
		})
		expect(config.layout).toBe('day-per-page')
		expect(config.layouts['day-per-page'].year).toBe(2040)
		expect(config.layouts['day-per-page']).not.toHaveProperty('futureOption')
	})
})
