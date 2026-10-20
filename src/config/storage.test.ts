import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultAppConfig } from './AppConfig'
import { loadConfig, saveConfig } from './storage'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** A minimal in-memory `localStorage`, since tests run without a DOM. */
function memoryStorage(): Storage {
	const items = new Map<string, string>()
	return {
		get length() {
			return items.size
		},
		clear: () => items.clear(),
		getItem: (key) => items.get(key) ?? null,
		key: (index) => [...items.keys()][index] ?? null,
		removeItem: (key) => void items.delete(key),
		setItem: (key, value) => void items.set(key, String(value)),
	}
}

describe('config storage', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', memoryStorage())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('round-trips the config', () => {
		const config = defaultAppConfig()
		config.layout = 'month-per-page'
		config.layouts['month-per-page'].year = 2031
		saveConfig(config)
		expect(loadConfig()).toEqual(config)
	})

	it('loads defaults when storage is empty or corrupt', () => {
		expect(loadConfig()).toEqual(defaultAppConfig())
		localStorage.setItem('calendarium-config', '{not json')
		expect(loadConfig()).toEqual(defaultAppConfig())
	})

	it('backs up data from a later version before overwriting it', () => {
		const later = [
			{ version: CONFIG_VERSION + 1, layouts: {}, future: 1 },
			{ version: CONFIG_VERSION, app: `${CONFIG_VERSION}.99.0`, layouts: {} },
		]
		for (const data of later) {
			const text = JSON.stringify(data)
			localStorage.setItem('calendarium-config', text)
			saveConfig(defaultAppConfig())
			expect(localStorage.getItem('calendarium-config-backup')).toBe(text)
			expect(JSON.parse(localStorage.getItem('calendarium-config')!)).toMatchObject({
				version: CONFIG_VERSION,
				app: APP_VERSION,
			})
		}
	})

	it('does not back up data of the current version', () => {
		saveConfig(defaultAppConfig())
		saveConfig(defaultAppConfig())
		expect(localStorage.getItem('calendarium-config-backup')).toBeNull()
	})
})
