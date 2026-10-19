import { CONFIG_VERSION, isLaterAppVersion } from './version'

// Storage and files are two formats, tagged with the same `CONFIG_VERSION` (the app's major
// version) and the app version that wrote them. Each format has an ordered list of migration
// steps; data is brought to the current version by applying the steps from its own version up,
// in order. A new major version is one new step at the end of each list (one that returns the
// data as is when that format did not change).

/** Untrusted data read from storage or a file, as an object whose fields can be read. */
export type StoredData = Record<string, unknown>

/** One step that brings data from the version before it to the next version. */
type Migration = (data: StoredData) => StoredData

/** The first config version; data tagged with any earlier one is not this app's. */
export const FIRST_CONFIG_VERSION = 3

/**
 * Storage steps; the step at index `i` migrates version `FIRST_CONFIG_VERSION + i` to the next.
 *
 * - 3: `{ version, app, layout, layouts: { <id>: {...} } }`, one set of options per layout.
 */
export const STORAGE_MIGRATIONS: readonly Migration[] = []

/**
 * File steps; the step at index `i` migrates version `FIRST_CONFIG_VERSION + i` to the next.
 *
 * - 3: `{ format, version, app, layout, ...options }`, one layout's options, flat.
 */
export const FILE_MIGRATIONS: readonly Migration[] = []

/** Marks a JSON file as one of this app's layout files. */
export const FILE_FORMAT = 'printable-calendar/layout'

/** `value` as an object whose fields can be read, or `null` when it is not a plain object. */
export function asObject(value: unknown): StoredData | null {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as StoredData)
		: null
}

/** The config version `data` is tagged with; `null` when it has none this app knows. */
export function versionOf(data: StoredData): number | null {
	const { version } = data
	return typeof version === 'number' &&
		Number.isInteger(version) &&
		version >= FIRST_CONFIG_VERSION
		? version
		: null
}

/**
 * Whether a later version of the app wrote `data`: a later config version, or the same one
 * from a later app version, which may have added fields this one would drop.
 */
export function isFromLaterVersion(data: StoredData): boolean {
	const version = versionOf(data)
	if (version === null) return false
	return version > CONFIG_VERSION || (version === CONFIG_VERSION && isLaterAppVersion(data.app))
}

/**
 * Applies the steps from `data`'s version up to the current one; data from a later version is
 * left as is. `null` when `data` has no valid version.
 */
function migrate(data: StoredData, migrations: readonly Migration[]): StoredData | null {
	const version = versionOf(data)
	if (version === null) return null
	let current = data
	for (let step = version - FIRST_CONFIG_VERSION; step < migrations.length; step++) {
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
export function isConfigFile(data: StoredData): boolean {
	return data.format === FILE_FORMAT
}
