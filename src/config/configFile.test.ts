import { describe, expect, it } from 'vitest'
import { LAYOUT_IDS } from './CalendarConfig'
import { defaultAppConfig, defaultLayoutConfig } from './layouts'
import { exportLayoutFile, parseConfigFile, serializeLayoutConfig } from './configFile'
import { FILE_FORMAT } from './migrations'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** A file's text: this app's format and the current version, plus `fields`. */
function fileText(fields: Record<string, unknown>): string {
	return JSON.stringify({ format: FILE_FORMAT, version: CONFIG_VERSION, ...fields })
}

describe('config files', () => {
	it('round-trips one layout through serializeLayoutConfig', () => {
		const defaults = defaultLayoutConfig('day-per-page')
		const config = {
			...defaults,
			year: 2031,
			firstHour: 5,
			page: { ...defaults.page, paperSize: 'a3' as const },
		}
		const text = serializeLayoutConfig('day-per-page', config)
		expect(parseConfigFile(text, 'year-per-page')).toEqual({
			layout: 'day-per-page',
			config,
			ignored: [],
			newer: false,
		})
	})

	it('exports the active layout, named after it and its year', () => {
		const config = { ...defaultAppConfig(), layout: 'week-per-page' as const }
		config.layouts['week-per-page'] = { ...config.layouts['week-per-page'], year: 2031 }
		const file = exportLayoutFile(config)
		expect(file.fileName).toBe('calendar-week-per-page-2031.json')
		expect(file.text).toBe(
			serializeLayoutConfig('week-per-page', config.layouts['week-per-page']),
		)
	})

	it('writes the format, the versions, the layout and only that layout’s options', () => {
		const config = defaultLayoutConfig('month-per-page')
		const data = JSON.parse(serializeLayoutConfig('month-per-page', config))
		expect(data).toEqual({
			format: FILE_FORMAT,
			version: CONFIG_VERSION,
			app: APP_VERSION,
			layout: 'month-per-page',
			...config,
		})
		expect(data).not.toHaveProperty('title')
		expect(data).not.toHaveProperty('layouts')
	})

	it('imports into the current layout when the file names none or an unknown one', () => {
		expect(parseConfigFile(fileText({ year: 2031 }), 'month-per-page')?.layout).toBe(
			'month-per-page',
		)
		expect(parseConfigFile(fileText({ layout: 'week' }), 'day-per-page')?.layout).toBe(
			'day-per-page',
		)
	})

	it('keeps only the fields of the layout it imports into', () => {
		const imported = parseConfigFile(
			fileText({ layout: 'month-per-page', title: 'Office' }),
			'year-per-page',
		)
		expect(imported?.config).not.toHaveProperty('title')
	})

	it('rejects files that are not a JSON object', () => {
		for (const text of ['not json', '[]', 'null', '2030']) {
			expect(parseConfigFile(text, 'year-per-page')).toBeNull()
		}
	})

	it('rejects JSON objects that are not a config file', () => {
		const files = [
			{ name: 'package', version: 3 },
			{ version: CONFIG_VERSION, year: 2030 },
			{ format: 'something-else', version: CONFIG_VERSION, year: 2030 },
		]
		for (const file of files) {
			expect(parseConfigFile(JSON.stringify(file), 'year-per-page')).toBeNull()
		}
	})

	it('rejects files without a version this app knows', () => {
		for (const version of [undefined, 1, 2, '3']) {
			const file = JSON.stringify({ format: FILE_FORMAT, version, year: 2030 })
			expect(parseConfigFile(file, 'year-per-page')).toBeNull()
		}
	})

	it('accepts a file holding no options', () => {
		const file = JSON.stringify({ format: FILE_FORMAT, version: CONFIG_VERSION })
		expect(parseConfigFile(file, 'month-per-page')?.config).toEqual(
			defaultLayoutConfig('month-per-page'),
		)
	})

	it('reports a file made by a later config version and keeps what it can read', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: CONFIG_VERSION + 1,
			layout: 'day-per-page',
			year: 2031,
			futureOption: 'x',
		})
		const imported = parseConfigFile(file, 'year-per-page')
		expect(imported?.newer).toBe(true)
		expect(imported?.config.year).toBe(2031)
		expect(imported?.config).not.toHaveProperty('futureOption')
	})

	it('reports a file made by a later app version of the same config version', () => {
		const file = (app: string) =>
			JSON.stringify({ format: FILE_FORMAT, version: CONFIG_VERSION, app, year: 2031 })
		expect(parseConfigFile(file(`${CONFIG_VERSION}.999.0`), 'year-per-page')?.newer).toBe(true)
		expect(parseConfigFile(file(APP_VERSION), 'year-per-page')?.newer).toBe(false)
		expect(parseConfigFile(file('0.1.0'), 'year-per-page')?.newer).toBe(false)
	})

	it('falls back to the layout’s defaults for invalid fields', () => {
		for (const layout of LAYOUT_IDS) {
			const file = JSON.stringify({
				format: FILE_FORMAT,
				version: CONFIG_VERSION,
				year: 2030,
				page: { orientation: 'up' },
			})
			expect(parseConfigFile(file, layout)).toEqual({
				layout,
				config: { ...defaultLayoutConfig(layout), year: 2030 },
				ignored: ['page.orientation'],
				newer: false,
			})
		}
	})

	it('lists the fields that were present but invalid', () => {
		const file = JSON.stringify({
			format: FILE_FORMAT,
			version: CONFIG_VERSION,
			layout: 'day-per-page',
			year: 2030,
			firstHour: 25,
			hourFormat: 'sundial',
			title: 'Not a day-per-page field',
			page: { paperSize: 'a4', margins: { top: 99, left: 5, right: 'wide' } },
		})
		expect(parseConfigFile(file, 'year-per-page')?.ignored).toEqual([
			'page.margins.top',
			'page.margins.right',
			'hourFormat',
			'firstHour',
		])
		const badPage = JSON.stringify({
			format: FILE_FORMAT,
			version: CONFIG_VERSION,
			page: 'big',
		})
		expect(parseConfigFile(badPage, 'year-per-page')?.ignored).toEqual(['page'])
	})
})
