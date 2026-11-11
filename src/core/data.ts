import { asObject } from './validation'

/**
 * A change to some of `T`'s fields: a nested object (not an array) is patched field by field, so
 * a patch reaches `page.margins.top` alone, while any other value replaces the field whole. For a
 * flat `T` it is `Partial<T>`.
 */
export type Patch<T> = {
	[K in keyof T]?: [T[K]] extends [readonly unknown[]]
		? T[K]
		: [T[K]] extends [object]
			? Patch<T[K]>
			: T[K]
}

/**
 * `value` with `patch` applied, nested objects field by field, so a nested object the patch does
 * not reach stays the same object; `value` itself when the patch changes nothing. A field
 * patched with `undefined` is left as it is.
 */
export function applyPatch<T extends object>(value: T, patch: Patch<T>): T {
	let result = value
	for (const key of Object.keys(patch) as (keyof T & string)[]) {
		const patched = patch[key] as unknown
		if (patched === undefined) continue
		const current = value[key]
		const next =
			asObject(current) !== null && asObject(patched) !== null
				? applyPatch(current as object, patched as Patch<object>)
				: patched
		if (next === current) continue
		if (result === value) result = { ...value }
		result[key] = next as T[keyof T & string]
	}
	return result
}

/**
 * Whether two plain values (strings, numbers, booleans, `null`, arrays and objects of them, as JSON
 * holds them) are the same, nested objects compared field by field whatever their key order.
 */
export function sameData(a: unknown, b: unknown): boolean {
	if (a === b) return true
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
	if (Array.isArray(a) !== Array.isArray(b)) return false
	const aRecord = a as Record<string, unknown>
	const bRecord = b as Record<string, unknown>
	const keys = Object.keys(aRecord)
	if (keys.length !== Object.keys(bRecord).length) return false
	return keys.every((key) => Object.hasOwn(bRecord, key) && sameData(aRecord[key], bRecord[key]))
}
