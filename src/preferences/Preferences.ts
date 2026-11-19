import { asObject, copyValid, oneOf, type Validators } from '../core/validation'
import { DEFAULT_ZOOM, isPreviewZoom, type PreviewZoom } from './zoom'

/**
 * How the app looks and behaves for the viewer, apart from any calendar: never printed, never in a
 * project file, and kept apart from the workspace. Loaded and saved by `storage.ts`.
 */
export interface Preferences {
	/** The sidebar's width in px, as last dragged; the sidebar keeps it within the window. */
	sidebarWidth: number
	/**
	 * The open sidebar section, `null` when all are closed. Layouts share the ids, so a section open
	 * on one layout, like the calendar's, is open on the others too.
	 */
	openSection: SectionId | null
	/** How large the preview draws the pages: a percent, or a fit following the preview's size. */
	previewZoom: PreviewZoom
	/** The app's colors: the system's light or dark scheme, or one of them whatever the system's. */
	theme: Theme
}

/**
 * The sidebar's sections, in its order: the project's, then one per option group, named after it.
 * A section is known by its id, never by its title, so a title can change without closing it.
 */
export const SECTION_IDS = [
	'project',
	'calendar',
	'events',
	'header',
	'miniMonth',
	'content',
	'footer',
	'page',
] as const
export type SectionId = (typeof SECTION_IDS)[number]

/** The themes, in the order the sidebar's theme button steps through them. */
export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** The theme after `theme`, back to the first after the last. */
export function nextTheme(theme: Theme): Theme {
	return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
}

/** The sidebar's default width, and the narrowest it can be, in px. */
export const SIDEBAR_MIN_WIDTH = 320

/** The preferences of a viewer who has changed none. */
export function defaultPreferences(): Preferences {
	return {
		sidebarWidth: SIDEBAR_MIN_WIDTH,
		openSection: null,
		previewZoom: DEFAULT_ZOOM,
		theme: 'system',
	}
}

function isSidebarWidth(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= SIDEBAR_MIN_WIDTH
}

const isSectionId = oneOf(SECTION_IDS)

function isOpenSection(value: unknown): value is SectionId | null {
	return value === null || isSectionId(value)
}

/** One check per preference, applied field by field when parsing. */
export const PREFERENCE_VALIDATORS: Validators<Preferences> = {
	sidebarWidth: isSidebarWidth,
	openSection: isOpenSection,
	previewZoom: isPreviewZoom,
	theme: oneOf(THEMES),
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
 * `preferences` with the section `id` opened, closing the one open before, so the sidebar shows
 * one group of fields at a time; or closed, when it was the open one.
 */
export function withSectionToggled(preferences: Preferences, id: SectionId): Preferences {
	return { ...preferences, openSection: preferences.openSection === id ? null : id }
}
