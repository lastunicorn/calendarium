import { asObject, type UntrustedObject } from '../core/validation'
import { defaultPreferences, type Preferences, parsePreferences } from './Preferences'

const STORAGE_KEY = 'calendarium-preferences'

/** Where builds before 4.6.0 kept each preference, read until the preferences are first saved. */
const LEGACY_WIDTH_KEY = 'calendarium-sidebar-width'
const LEGACY_SECTIONS_KEY = 'calendarium-open-sections'

/** The JSON stored under `key`; `null` when there is none, or it isn't JSON. */
function storedJson(key: string): unknown {
	const raw = localStorage.getItem(key)
	if (raw === null) return null
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

/**
 * The preferences as builds before 4.6.0 stored them: the width as a number, and the open section
 * as a list of at most one title.
 */
function legacyPreferences(): UntrustedObject {
	const data: UntrustedObject = {}
	const width = localStorage.getItem(LEGACY_WIDTH_KEY)
	if (width !== null) data.sidebarWidth = Math.round(Number(width))
	const sections = storedJson(LEGACY_SECTIONS_KEY)
	if (Array.isArray(sections)) data.openSection = sections[0] ?? null
	return data
}

/**
 * The `Preferences` repository: one object per browser, under one key. Loads it, from the earlier
 * builds' keys when it was never saved, falling back to the defaults when storage is unavailable.
 */
export function loadPreferences(): Preferences {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return parsePreferences(stored === null ? legacyPreferences() : storedJson(STORAGE_KEY))
	} catch {
		return defaultPreferences()
	}
}

/**
 * Saves the preferences, keeping the fields a later version stored that this one doesn't know,
 * and drops the earlier builds' keys.
 */
export function savePreferences(preferences: Preferences): void {
	try {
		const stored = asObject(storedJson(STORAGE_KEY)) ?? {}
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, ...preferences }))
		localStorage.removeItem(LEGACY_WIDTH_KEY)
		localStorage.removeItem(LEGACY_SECTIONS_KEY)
	} catch {
		// Storage may be unavailable (private mode, quota); the preferences then reset on reload.
	}
}
