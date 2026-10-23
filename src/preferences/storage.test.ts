import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultPreferences } from './Preferences'
import { loadPreferences, savePreferences } from './storage'
import { memoryStorage } from '../test/memoryStorage'

describe('preferences storage', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', memoryStorage())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('loads the defaults when nothing is stored', () => {
		expect(loadPreferences()).toEqual(defaultPreferences())
	})

	it('round-trips the preferences', () => {
		const preferences = {
			sidebarWidth: 512,
			openSection: 'Events',
			previewZoom: 'fit-width' as const,
		}
		savePreferences(preferences)
		expect(loadPreferences()).toEqual(preferences)
	})

	it('reads the keys of earlier builds, and drops them once saved', () => {
		localStorage.setItem('calendarium-sidebar-width', '400')
		localStorage.setItem('calendarium-open-sections', '["Calendar"]')
		const preferences = loadPreferences()
		expect(preferences).toEqual({
			...defaultPreferences(),
			sidebarWidth: 400,
			openSection: 'Calendar',
		})

		savePreferences(preferences)
		expect(localStorage.getItem('calendarium-sidebar-width')).toBeNull()
		expect(localStorage.getItem('calendarium-open-sections')).toBeNull()
		expect(loadPreferences()).toEqual(preferences)
	})

	it('ignores the earlier builds’ keys once the preferences were saved', () => {
		savePreferences({ ...defaultPreferences(), sidebarWidth: 360 })
		localStorage.setItem('calendarium-sidebar-width', '400')
		expect(loadPreferences().sidebarWidth).toBe(360)
	})

	it('keeps the fields a later version stored when saving', () => {
		localStorage.setItem('calendarium-preferences', '{"theme":"dark","sidebarWidth":400}')
		savePreferences({ ...defaultPreferences(), sidebarWidth: 420 })
		expect(JSON.parse(localStorage.getItem('calendarium-preferences')!)).toEqual({
			theme: 'dark',
			sidebarWidth: 420,
			openSection: null,
			previewZoom: 100,
		})
	})

	it('falls back to the defaults for stored text that is not JSON', () => {
		localStorage.setItem('calendarium-preferences', '{not json')
		expect(loadPreferences()).toEqual(defaultPreferences())
	})

	it('works without storage', () => {
		vi.stubGlobal('localStorage', undefined)
		expect(loadPreferences()).toEqual(defaultPreferences())
		expect(() => savePreferences(defaultPreferences())).not.toThrow()
	})
})
