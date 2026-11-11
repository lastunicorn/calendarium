import type { LayoutId, LayoutOptions } from '../layouts'

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

const PROJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

/** Whether `value` is a project id: a v4 UUID, in lowercase. */
export function isProjectId(value: unknown): value is ProjectId {
	return typeof value === 'string' && PROJECT_ID.test(value)
}

/**
 * A new random project id. Built from `crypto.getRandomValues`, which works everywhere, rather
 * than `crypto.randomUUID`, which needs a secure context: the release zip may be served over
 * plain HTTP.
 */
export function newProjectId(): ProjectId {
	const bytes = crypto.getRandomValues(new Uint8Array(16))
	bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // the RFC 4122 variant
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20),
	].join('-')
}
