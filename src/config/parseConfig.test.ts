import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS, mapLayouts } from '../layouts'
import { defaultAppConfig } from './AppConfig'
import { parseConfig, toStoredConfig } from './parseConfig'
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

	// Each layout's own fields are tested in its `options.test.ts`; these check the shared ones,
	// and that each layout's options are parsed by its own spec.
	it('keeps the valid shared fields of every layout, and the active layout', () => {
		const common = {
			year: 2030,
			locale: 'ro-RO',
			weekStart: 6,
			events: '0000-12-25 Christmas',
			page: {
				paperSize: 'letter',
				orientation: 'landscape',
				margins: { top: 5, right: 12.5, bottom: 0, left: 50 },
				equalMargins: false,
				mirrorMargins: true,
				spine: 'top',
			},
		}
		const config = {
			layout: 'month-per-page',
			layouts: mapLayouts((layout) => ({ ...defaultLayoutOptions(layout), ...common })),
		}
		expect(parseConfig({ version: CONFIG_VERSION, ...config })).toEqual(config)
	})

	it('drops invalid shared fields of every layout, and an unknown active layout', () => {
		const invalidCommon = {
			year: 2030.5,
			locale: 'xx',
			weekStart: 7,
			events: 42,
			page: { paperSize: 'b5', orientation: 'up', margins: 'wide' },
		}
		const config = parseConfig({
			version: CONFIG_VERSION,
			layout: 'quarter-per-page',
			layouts: Object.fromEntries(LAYOUT_IDS.map((layout) => [layout, invalidCommon])),
		})
		expect(config).toEqual(defaultAppConfig())
	})

	it('reads each layout’s options by its own rules', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: {
				'year-per-page': { weekdayFormat: 'full' },
				'month-per-page': { weekdayFormat: 'full' },
			},
		})
		expect(config.layouts['month-per-page'].weekdayFormat).toBe('full')
		expect(config.layouts['year-per-page'].weekdayFormat).toBe(
			defaultLayoutOptions('year-per-page').weekdayFormat,
		)
	})

	it('reads older data through the layouts’ own migration steps', () => {
		const config = parseConfig({
			version: 3,
			layouts: { 'week-per-page': { highlightWeekends: 'off', showWeekNumbers: false } },
		})
		expect(config.layouts['week-per-page']).toMatchObject({
			highlightWeekendDays: false,
			showHeaderWeek: false,
		})
	})

	it('ignores fields a layout does not have', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'month-per-page': { subtitle: 'Office', firstHour: 3 } },
		})
		expect(config.layouts['month-per-page']).not.toHaveProperty('subtitle')
		expect(config.layouts['month-per-page']).not.toHaveProperty('firstHour')
	})

	it('falls back to defaults for one broken layout only', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'year-per-page': 'broken', 'day-per-page': { year: 2040 } },
		})
		expect(config.layouts['year-per-page']).toEqual(defaultLayoutOptions('year-per-page'))
		expect(config.layouts['day-per-page'].year).toBe(2040)
	})

	it('falls back to the default page when `page` is not an object', () => {
		const config = parseConfig({
			version: CONFIG_VERSION,
			layouts: { 'month-per-page': { page: 'a4' } },
		})
		expect(config.layouts['month-per-page'].page).toEqual(
			defaultLayoutOptions('month-per-page').page,
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
			...defaultLayoutOptions('year-per-page').page.margins,
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
