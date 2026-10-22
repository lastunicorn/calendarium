import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultWorkspace } from './Workspace'
import { loadWorkspace, saveWorkspace } from './storage'
import { APP_VERSION, FORMAT_VERSION } from './version'

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

describe('workspace storage', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', memoryStorage())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('round-trips the workspace', () => {
		const workspace = defaultWorkspace()
		workspace.layout = 'month-per-page'
		workspace.layouts['month-per-page'].year = 2031
		saveWorkspace(workspace)
		expect(loadWorkspace()).toEqual(workspace)
	})

	it('loads defaults when storage is empty or corrupt', () => {
		expect(loadWorkspace()).toEqual(defaultWorkspace())
		localStorage.setItem('calendarium-config', '{not json')
		expect(loadWorkspace()).toEqual(defaultWorkspace())
	})

	it('backs up data from a later version before overwriting it', () => {
		const later = [
			{ version: FORMAT_VERSION + 1, layouts: {}, future: 1 },
			{ version: FORMAT_VERSION, app: `${FORMAT_VERSION}.99.0`, layouts: {} },
		]
		for (const data of later) {
			const text = JSON.stringify(data)
			localStorage.setItem('calendarium-config', text)
			saveWorkspace(defaultWorkspace())
			expect(localStorage.getItem('calendarium-config-backup')).toBe(text)
			expect(JSON.parse(localStorage.getItem('calendarium-config')!)).toMatchObject({
				version: FORMAT_VERSION,
				app: APP_VERSION,
			})
		}
	})

	it('does not back up data of the current version', () => {
		saveWorkspace(defaultWorkspace())
		saveWorkspace(defaultWorkspace())
		expect(localStorage.getItem('calendarium-config-backup')).toBeNull()
	})
})
