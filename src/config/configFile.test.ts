import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { parseConfigFile, serializeConfig } from './configFile'
import { CONFIG_VERSION } from './parseConfig'

describe('config files', () => {
	it('round-trips through serializeConfig', () => {
		const defaults = defaultConfig()
		const config = {
			...defaults,
			year: 2031,
			title: 'Office',
			page: { ...defaults.page, paperSize: 'a3' as const },
		}
		expect(parseConfigFile(serializeConfig(config))).toEqual(config)
	})

	it('imports files exported in the version 1 format', () => {
		const v1File = '{"version": 1, "year": 2031, "paperSize": "a3", "orientation": "landscape"}'
		expect(parseConfigFile(v1File)?.page).toMatchObject({
			paperSize: 'a3',
			orientation: 'landscape',
		})
	})

	it('tags the file with the format version', () => {
		expect(JSON.parse(serializeConfig(defaultConfig())).version).toBe(CONFIG_VERSION)
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
