import { asObject, copyValid, isString, oneOf, type Validators } from '../core/validation'
import { DEFAULT_ZOOM, PREVIEW_ZOOMS, type PreviewZoom } from './zoom'

/**
 * How the app looks and behaves for the viewer, apart from any calendar: never printed, never in a
 * project file, and kept apart from the workspace. Loaded and saved by `storage.ts`.
 */
export interface Preferences {
	/** The sidebar's width in px, as last dragged; the sidebar keeps it within the window. */
	sidebarWidth: number
	/**
	 * The title of the open sidebar section, `null` when all are closed. Layouts share titles, so a
	 * section open on one layout, like "Calendar", is open on the others too.
	 */
	openSection: string | null
	/** How large the preview draws the pages: a level, or a fit following the preview's size. */
	previewZoom: PreviewZoom
}

/** The sidebar's default width, and the narrowest it can be, in px. */
export const SIDEBAR_MIN_WIDTH = 320

/** The preferences of a viewer who has changed none. */
export function defaultPreferences(): Preferences {
	return { sidebarWidth: SIDEBAR_MIN_WIDTH, openSection: null, previewZoom: DEFAULT_ZOOM }
}

function isSidebarWidth(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= SIDEBAR_MIN_WIDTH
}

function isOpenSection(value: unknown): value is string | null {
	return value === null || isString(value)
}

/** One check per preference, applied field by field when parsing. */
export const PREFERENCE_VALIDATORS: Validators<Preferences> = {
	sidebarWidth: isSidebarWidth,
	openSection: isOpenSection,
	previewZoom: oneOf(PREVIEW_ZOOMS),
}

/**
 * Keeps only the valid preferences of untrusted stored data, the others falling back to their
 * defaults; fields this version doesn't know are left out.
 */
export function parsePreferences(data: unknown): Preferences {
	const preferences = defaultPreferences()
	const stored = asObject(data)
	if (stored !== null) copyValid(preferences, stored, PREFERENCE_VALIDATORS, [])
	return preferences
}

/**
 * `preferences` with the section titled `title` opened, closing the one open before, so the
 * sidebar shows one group of fields at a time; or closed, when it was the open one.
 */
export function withSectionToggled(preferences: Preferences, title: string): Preferences {
	return { ...preferences, openSection: preferences.openSection === title ? null : title }
}
