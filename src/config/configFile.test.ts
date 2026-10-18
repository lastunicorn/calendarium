import { describe, expect, it } from 'vitest'
import { defaultConfig } from './CalendarConfig'
import { parseConfigFile, serializeConfig } from './configFile'
import { CONFIG_VERSION } from './parseConfig'

describe('config files', () => {
	it('round-trips through serializeConfig', () => {
		const config = { ...defaultConfig(), year: 2031, title: 'Office', paperSize: 'a3' as const }
		expect(parseConfigFile(serializeConfig(config))).toEqual(config)
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
