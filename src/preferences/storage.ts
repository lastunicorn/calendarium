import { asObject, isString, type UntrustedObject } from '../core/validation'
import {
	defaultPreferences,
	parsePreferences,
	type Preferences,
	type SectionId,
} from './Preferences'

const STORAGE_KEY = 'calendarium-preferences'

/** Where builds before 4.6.0 kept each preference, read until the preferences are first saved. */
const LEGACY_WIDTH_KEY = 'calendarium-sidebar-width'
const LEGACY_SECTIONS_KEY = 'calendarium-open-sections'

/**
 * The open section's id by the title builds up to 6.0.0 stored in its place. Only 6.0.0's titles:
 * an earlier build's others (like "Appearance") already opened no section in 6.0.0.
 */
const LEGACY_SECTION_IDS: Readonly<Record<string, SectionId>> = {
	Calendar: 'calendar',
	Events: 'events',
	Header: 'header',
	'Mini calendar': 'miniMonth',
	Content: 'content',
	Footer: 'footer',
	Page: 'page',
}

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

/** The stored preferences, the open section by its id where an earlier build stored its title. */
function withSectionId(data: UntrustedObject): UntrustedObject {
	const title = data.openSection
	if (!isString(title) || !Object.hasOwn(LEGACY_SECTION_IDS, title)) return data
	return { ...data, openSection: LEGACY_SECTION_IDS[title] }
}

/**
 * The `Preferences` repository: one object per browser, under one key. Loads it, from the earlier
 * builds' keys when it was never saved, falling back to the defaults when storage is unavailable.
 */
export function loadPreferences(): Preferences {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		const data = stored === null ? legacyPreferences() : asObject(storedJson(STORAGE_KEY))
		return parsePreferences(data === null ? null : withSectionId(data))
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
