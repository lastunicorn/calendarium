import { asObject, type UntrustedObject } from '../core/validation'
import { isLayoutId, migrateLayoutOptions, type LayoutId } from '../layouts'
import {
	applyMigrations,
	FIRST_FORMAT_VERSION,
	versionOf,
	type Migration,
	type StoredData,
} from './migrations'

// The formats of 3 to 5, frozen: storage held one set of options per layout, a file one layout's
// options, flat beside its tags. They are only read, brought to 5 by their own steps, then
// converted to 6's projects, the layouts' ids mapped first and each layout's options by its own
// step from 5. Nothing here changes once 6 is released.

/** Marks a JSON file as one of this app's project files from 3 to 5. */
export const LEGACY_FILE_FORMAT = 'printable-calendar/layout'

/** The last format version of the legacy formats. */
const LAST_LEGACY_VERSION = 5

/**
 * The ids the layouts had before 6, each mapped to its id now. The steps find a layout by its
 * current id, so legacy data has its ids mapped before any step runs; an id that is neither old
 * nor current (a later version's layout) is left as is.
 */
export const LEGACY_LAYOUT_IDS: Readonly<Record<string, LayoutId>> = {
	'year-per-page': 'yearly',
	'month-per-page': 'monthly',
	'week-per-page': 'weekly',
	'day-per-page': 'daily',
}

/** `id` as the layout is named now. */
function currentLayoutId(id: string): string {
	return Object.hasOwn(LEGACY_LAYOUT_IDS, id) ? LEGACY_LAYOUT_IDS[id] : id
}

/** The legacy storage step from `version` that changes only the layouts' options, each by its own step. */
function layoutsInStorage(version: number): Migration {
	return (data) => {
		const layouts = asObject(data.layouts)
		if (layouts === null) return data
		const upgraded: StoredData = {}
		for (const [layout, options] of Object.entries(layouts)) {
			const object = asObject(options)
			upgraded[layout] =
				object === null ? options : migrateLayoutOptions(layout, version, object)
		}
		return { ...data, layouts: upgraded }
	}
}

/** The legacy file step from `version` that changes only the options, by the step of the layout the file names. */
function layoutInFile(version: number): Migration {
	return (data) => migrateLayoutOptions(data.layout, version, data)
}

/**
 * Legacy storage steps; the step at index `i` migrates version `FIRST_FORMAT_VERSION + i` to the
 * next.
 *
 * - 3: `{ version, app, layout, layouts: { <id>: {...} } }`, one set of options per layout, flat.
 * - 4: the same; the week and day layouts' options changed (see their `migrations.ts`).
 * - 5: the same; the week layout's options changed (see its `migrations.ts`).
 */
export const LEGACY_STORAGE_MIGRATIONS: readonly Migration[] = [
	layoutsInStorage(3),
	layoutsInStorage(4),
]

/**
 * Legacy file steps; the step at index `i` migrates version `FIRST_FORMAT_VERSION + i` to the
 * next.
 *
 * - 3: `{ format, version, app, layout, ...options }`, one layout's options, flat.
 * - 4: the same; the week and day layouts' options changed (see their `migrations.ts`).
 * - 5: the same; the week layout's options changed (see its `migrations.ts`).
 */
export const LEGACY_FILE_MIGRATIONS: readonly Migration[] = [layoutInFile(3), layoutInFile(4)]

/** `data`'s format version when it is a legacy one, from 3 to 5; `null` otherwise. */
function legacyVersionOf(data: StoredData): number | null {
	const version = versionOf(data)
	return version !== null && version <= LAST_LEGACY_VERSION ? version : null
}

/**
 * A legacy file (`LEGACY_FILE_FORMAT`, from 3 to 5) as 6's project fields, still untrusted: the
 * layout it names, by its current id, its options grouped as 6 groups them, an empty name and no
 * id. `null` when it has no legacy version. The format is not checked here.
 */
export function legacyFile(data: StoredData): UntrustedObject | null {
	const version = legacyVersionOf(data)
	if (version === null) return null
	const layout = typeof data.layout === 'string' ? currentLayoutId(data.layout) : data.layout
	const at5 = applyMigrations(
		{ ...data, layout },
		version,
		FIRST_FORMAT_VERSION,
		LEGACY_FILE_MIGRATIONS,
	)
	const {
		format: _format,
		version: _version,
		app: _app,
		layout: _layout,
		...options
	} = layoutInFile(LAST_LEGACY_VERSION)(at5)
	return { id: null, name: '', layout, options }
}

/** Legacy storage as 6 reads it: the layout that was shown, and each layout's options. */
export interface LegacyWorkspace {
	/** The layout that was shown; `null` when it names none this app has. */
	shown: LayoutId | null
	/**
	 * Each stored layout's options, grouped as 6 groups them, still untrusted: the candidates for
	 * the projects the storage becomes. Layouts this app doesn't have are left out.
	 */
	layouts: Partial<Record<LayoutId, unknown>>
}

/** Legacy storage (from 3 to 5) as 6 reads it; `null` when it has no legacy version. */
export function legacyWorkspace(data: StoredData): LegacyWorkspace | null {
	const version = legacyVersionOf(data)
	if (version === null) return null
	const stored = asObject(data.layouts) ?? {}
	const renamed: StoredData = {}
	for (const [layout, options] of Object.entries(stored)) {
		renamed[currentLayoutId(layout)] = options
	}
	const at5 = applyMigrations(
		{ ...data, layouts: renamed },
		version,
		FIRST_FORMAT_VERSION,
		LEGACY_STORAGE_MIGRATIONS,
	)
	const at6 = layoutsInStorage(LAST_LEGACY_VERSION)(at5)
	const layouts: Partial<Record<LayoutId, unknown>> = {}
	for (const [layout, options] of Object.entries(asObject(at6.layouts) ?? {})) {
		if (isLayoutId(layout)) layouts[layout] = options
	}
	const shown = typeof data.layout === 'string' ? currentLayoutId(data.layout) : null
	return { shown: isLayoutId(shown) ? shown : null, layouts }
}
