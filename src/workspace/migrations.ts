import { migrateLayoutOptions } from '../layouts'
import { asObject, type UntrustedObject } from '../core/validation'
import { FORMAT_VERSION, isLaterAppVersion } from './version'

// Storage and files are two formats, tagged with the same `FORMAT_VERSION` (the app's major
// version) and the app version that wrote them. Each format has an ordered list of migration
// steps; data is brought to the current version by applying the steps from its own version up,
// in order. A new major version is one new step at the end of each list. A layout's own options
// change through that layout's steps (`LayoutSpec.migrations`), which `layoutsInStorage` and
// `layoutInFile` apply; a step that also changes the format's shape does that around them.

/** Untrusted data read from storage or a file, as an object whose fields can be read. */
export type StoredData = UntrustedObject

/** One step that brings data from the version before it to the next version. */
type Migration = (data: StoredData) => StoredData

/** The first format version; data tagged with any earlier one is not this app's. */
export const FIRST_FORMAT_VERSION = 3

/** The storage step from `version` that changes only the layouts' options, each by its own step. */
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

/**
 * The file step from `version` that changes only the options, by the step of the layout the file
 * names; a file that names no layout is left as is.
 */
function layoutInFile(version: number): Migration {
	return (data) => migrateLayoutOptions(data.layout, version, data)
}

/**
 * Storage steps; the step at index `i` migrates version `FIRST_FORMAT_VERSION + i` to the next.
 *
 * - 3: `{ version, app, layout, layouts: { <id>: {...} } }`, one set of options per layout.
 * - 4: the same; the week and day layouts' options changed (see their `migrations.ts`).
 */
export const STORAGE_MIGRATIONS: readonly Migration[] = [layoutsInStorage(3)]

/**
 * File steps; the step at index `i` migrates version `FIRST_FORMAT_VERSION + i` to the next.
 *
 * - 3: `{ format, version, app, layout, ...options }`, one layout's options, flat.
 * - 4: the same; the week and day layouts' options changed (see their `migrations.ts`).
 */
export const FILE_MIGRATIONS: readonly Migration[] = [layoutInFile(3)]

/** Marks a JSON file as one of this app's layout files. */
export const FILE_FORMAT = 'printable-calendar/layout'

/** The format version `data` is tagged with; `null` when it has none this app knows. */
export function versionOf(data: StoredData): number | null {
	const { version } = data
	return typeof version === 'number' &&
		Number.isInteger(version) &&
		version >= FIRST_FORMAT_VERSION
		? version
		: null
}

/**
 * Whether a later version of the app wrote `data`: a later format version, or the same one
 * from a later app version, which may have added fields this one would drop.
 */
export function isFromLaterVersion(data: StoredData): boolean {
	const version = versionOf(data)
	if (version === null) return false
	return version > FORMAT_VERSION || (version === FORMAT_VERSION && isLaterAppVersion(data.app))
}

/**
 * Applies the steps from `data`'s version up to the current one; data from a later version is
 * left as is. `null` when `data` has no valid version.
 */
function migrate(data: StoredData, migrations: readonly Migration[]): StoredData | null {
	const version = versionOf(data)
	if (version === null) return null
	let current = data
	for (let step = version - FIRST_FORMAT_VERSION; step < migrations.length; step++) {
		current = migrations[step](current)
	}
	return current
}

/** Brings stored app data of any version to the current storage shape. */
export function upgradeStorage(data: StoredData): StoredData | null {
	return migrate(data, STORAGE_MIGRATIONS)
}

/** Brings a file of any version to the current file shape. */
export function upgradeFile(data: StoredData): StoredData | null {
	return migrate(data, FILE_MIGRATIONS)
}

/** Whether `data` is one of this app's files: it carries `FILE_FORMAT`. */
export function isLayoutFile(data: StoredData): boolean {
	return data.format === FILE_FORMAT
}
