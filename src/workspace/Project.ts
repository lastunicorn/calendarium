import type { LayoutId, LayoutOptions } from '../layouts'
import type { IdAccess } from '../ports/IdAccess'

/** A project's identity, kept whatever its name: a lowercase v4 UUID (`isProjectId`). */
export type ProjectId = string

/**
 * One calendar being made: its identity, its name, its layout and that layout's options, as a
 * project file holds them and the preview draws them. One variant per layout, so the options have
 * that layout's type. `Id` is `ProjectId | null` for a project read from a file that has none yet.
 */
export type Project<Id extends ProjectId | null = ProjectId> = {
	[K in LayoutId]: {
		id: Id
		/** Kept as typed, `''` when it has none; trimmed only to show it or name a file. */
		name: string
		layout: K
		options: LayoutOptions[K]
	}
}[LayoutId]

/**
 * A project of `layout`, with `options` of that layout's type. TypeScript can't follow that
 * pairing through the union when `layout` may be any layout, so this and `withOptions` are the
 * one place it is asserted rather than checked; a layout given as itself (`'weekly'`) takes only
 * its own options.
 */
export function projectOf<K extends LayoutId, Id extends ProjectId | null = ProjectId>(fields: {
	id: Id
	name: string
	layout: K
	options: LayoutOptions[K]
}): Project<Id> {
	const { id, name, layout, options } = fields
	return { id, name, layout, options } as Project<Id>
}

/**
 * `project` with other options of its own layout. A project that may be of any layout takes any
 * layout's options, so the caller pairs them, as for `projectOf`: options built from
 * `project.layout` or `project.options`.
 */
export function withOptions<P extends Project>(project: P, options: P['options']): P {
	return { ...project, options }
}

const PROJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

/** Whether `value` is a project id: a v4 UUID, in lowercase. */
export function isProjectId(value: unknown): value is ProjectId {
	return typeof value === 'string' && PROJECT_ID.test(value)
}

/** A new project id, from `ids`, whose lowercase v4 UUIDs are what `isProjectId` checks. */
export function newProjectId(ids: IdAccess): ProjectId {
	return ids.newId()
}
