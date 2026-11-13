import { asObject, type UntrustedObject } from '../core/validation'
import { migrateLayoutOptions } from '../layouts'
import { FORMAT_VERSION, isLaterAppVersion } from './version'

// Stored data and files are tagged with the same `FORMAT_VERSION` (the app's major version) and
// the app version that wrote them. From 6 on, a file and a project in storage are one shape, the
// serialized project (`projectDocument.ts`), with one ordered list of migration steps,
// `PROJECT_MIGRATIONS`; data is brought to the current version by applying the steps from its own
// version up, in order. A new major version is one new step at the end of it. A layout's own
// options change through that layout's steps (`LayoutSpec.migrations`), which `layoutInProject`
// applies; a step that also changes the shape does that around it. The formats of 3 to 5, and
// their conversion to 6, are frozen in `legacy.ts`.

/** Untrusted data read from storage or a file, as an object whose fields can be read. */
export type StoredData = UntrustedObject

/** One step that brings data from the version before it to the next version. */
export type Migration = (data: StoredData) => StoredData

/** The first format version; data tagged with any earlier one is not this app's. */
export const FIRST_FORMAT_VERSION = 3

/** The first format version of the serialized project, which files and storage share. */
export const FIRST_PROJECT_VERSION = 6

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
 * `data`, of format version `version`, after the steps of `migrations` from that version on, the
 * step at index `i` migrating version `firstVersion + i` to the next; data from a version after
 * the last step is left as is.
 */
export function applyMigrations(
	data: StoredData,
	version: number,
	firstVersion: number,
	migrations: readonly Migration[],
): StoredData {
	let current = data
	for (let step = version - firstVersion; step < migrations.length; step++) {
		current = migrations[step](current)
	}
	return current
}

/**
 * The serialized project's step from `version` that changes only its options, by the step of the
 * layout it names; a project whose options are not an object is left as is.
 */
export function layoutInProject(version: number): Migration {
	return (data) => {
		const options = asObject(data.options)
		if (options === null) return data
		return { ...data, options: migrateLayoutOptions(data.layout, version, options) }
	}
}

/**
 * Serialized project steps; the step at index `i` migrates version `FIRST_PROJECT_VERSION + i` to
 * the next, a layout's options by `layoutInProject(version)`.
 *
 * - 6: `{ format, version, app, id, name, layout, options }`, one project, its options grouped
 *   (`calendar`, `events`, `header`, `miniMonth`, `content`, `footer`, `page`, as each layout has
 *   them).
 */
export const PROJECT_MIGRATIONS: readonly Migration[] = []

/**
 * Brings a serialized project of `FIRST_PROJECT_VERSION` or later to the current shape; one from
 * a later version is left as is. `null` when `data` has no such version.
 */
export function upgradeProject(data: StoredData): StoredData | null {
	const version = versionOf(data)
	if (version === null || version < FIRST_PROJECT_VERSION) return null
	return applyMigrations(data, version, FIRST_PROJECT_VERSION, PROJECT_MIGRATIONS)
}
