import { describe, expect, it } from 'vitest'
import { DEFAULTS, LAYOUT_IDS } from './CalendarConfig'
import { parseConfigFile, serializeLayoutConfig } from './configFile'
import { CONFIG_VERSION } from './parseConfig'

describe('config files', () => {
	it('round-trips one layout through serializeLayoutConfig', () => {
		const defaults = DEFAULTS['day-per-page']()
		const config = {
			...defaults,
			year: 2031,
			firstHour: 5,
			page: { ...defaults.page, paperSize: 'a3' as const },
		}
		const text = serializeLayoutConfig('day-per-page', config)
		expect(parseConfigFile(text, 'year-per-page')).toEqual({ layout: 'day-per-page', config })
	})

	it('writes the version, the layout and only that layout’s options', () => {
		const config = DEFAULTS['month-per-page']()
		const data = JSON.parse(serializeLayoutConfig('month-per-page', config))
		expect(data).toEqual({ version: CONFIG_VERSION, layout: 'month-per-page', ...config })
		expect(data).not.toHaveProperty('title')
		expect(data).not.toHaveProperty('layouts')
	})

	it('imports into the current layout when the file names none or an unknown one', () => {
		expect(parseConfigFile('{"year": 2031}', 'month-per-page')?.layout).toBe('month-per-page')
		expect(parseConfigFile('{"layout": "week"}', 'day-per-page')?.layout).toBe('day-per-page')
	})

	it('keeps only the fields of the layout it imports into', () => {
		const imported = parseConfigFile(
			'{"layout": "month-per-page", "title": "Office"}',
			'year-per-page',
		)
		expect(imported?.config).not.toHaveProperty('title')
	})

	it('imports files exported in the version 2 format', () => {
		const v2File = JSON.stringify({
			version: 2,
			layout: 'year-one-page',
			year: 2031,
			title: 'Office',
			page: { paperSize: 'a3' },
		})
		const imported = parseConfigFile(v2File, 'day-per-page')
		expect(imported?.layout).toBe('year-per-page')
		expect(imported?.config).toMatchObject({ year: 2031, title: 'Office' })
		expect(imported?.config.page.paperSize).toBe('a3')
	})

	it('imports files exported in the version 1 format', () => {
		const v1File = '{"version": 1, "year": 2031, "paperSize": "a3", "orientation": "landscape"}'
		expect(parseConfigFile(v1File, 'year-per-page')?.config.page).toMatchObject({
			paperSize: 'a3',
			orientation: 'landscape',
		})
	})

	it('rejects files that are not a JSON object', () => {
		for (const text of ['not json', '[]', 'null', '2030']) {
			expect(parseConfigFile(text, 'year-per-page')).toBeNull()
		}
	})

	it('falls back to the layout’s defaults for invalid fields', () => {
		for (const layout of LAYOUT_IDS) {
			expect(parseConfigFile('{"year": 2030, "orientation": "up"}', layout)).toEqual({
				layout,
				config: { ...DEFAULTS[layout](), year: 2030 },
			})
		}
	})
})
