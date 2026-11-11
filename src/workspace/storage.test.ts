import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultLayoutOptions } from '../layouts'
import { defaultWorkspace, type Workspace } from './Workspace'
import { loadWorkspace, saveWorkspace } from './storage'
import { APP_VERSION, FORMAT_VERSION } from './version'
import { memoryStorage } from '../test/memoryStorage'

describe('workspace storage', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', memoryStorage())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('round-trips the workspace', () => {
		const id = '00000000-0000-4000-8000-000000000001'
		const defaults = defaultLayoutOptions('monthly')
		const options = { ...defaults, calendar: { ...defaults.calendar, year: 2031 } }
		const workspace: Workspace = {
			projects: { [id]: { id, name: 'Office', layout: 'monthly', options } },
			open: id,
		}
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
			{ version: FORMAT_VERSION + 1, projects: [], future: 1 },
			{ version: FORMAT_VERSION, app: `${FORMAT_VERSION}.99.0`, projects: [] },
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
