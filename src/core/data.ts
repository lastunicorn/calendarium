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
