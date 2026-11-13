import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { applyPatch, sameData, type Patch } from './data'

// The rules `applyPatch` and `sameData` follow for any data, checked on random values
// (`data.test.ts` has the examples). Options are JSON-like objects, so the values are too.

const RUNS = { numRuns: 200 }

/** A JSON value, `-0` read back as `0`, as `JSON.parse` gives it. */
const json = fc.jsonValue().map((value) => JSON.parse(JSON.stringify(value)) as unknown)

/**
 * A value and a copy of it, two values, which are mostly different, or an array and the object of
 * its entries (`['x']` and `{ 0: 'x' }`), which are not the same.
 */
const pair = fc.oneof(
	json.map((value) => [value, structuredClone(value)] as const),
	fc.tuple(json, json),
	fc.array(json, { maxLength: 3 }).map((array) => [array, { ...array }] as const),
)

/** Options-like objects over a few keys, so that an object and a patch share some. */
const { record } = fc.letrec<{ value: unknown; record: Record<string, unknown> }>((tie) => ({
	value: fc.oneof(
		{ depthSize: 'small' },
		fc.integer(),
		fc.string(),
		fc.boolean(),
		fc.constant(null),
		fc.array(fc.integer(), { maxLength: 3 }),
		tie('record'),
	),
	record: fc.dictionary(fc.constantFrom('a', 'b', 'c', 'd'), tie('value'), { maxKeys: 4 }),
}))

/** `value` as JSON with every object's keys sorted: the same text for the same data. */
function canonical(value: unknown): string {
	return JSON.stringify(value, (_, field: unknown) =>
		typeof field === 'object' && field !== null && !Array.isArray(field)
			? Object.fromEntries(Object.entries(field).toSorted(([a], [b]) => (a < b ? -1 : 1)))
			: field,
	)
}

/** `value` with its keys in the reverse order, every nested object's too. */
function reversed(value: unknown): unknown {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return value
	return Object.fromEntries(
		Object.entries(value)
			.toReversed()
			.map(([key, field]) => [key, reversed(field)]),
	)
}

describe('sameData', () => {
	it('says two JSON values are the same exactly when they are the same JSON, key order aside', () => {
		fc.assert(
			fc.property(pair, ([a, b]) => {
				expect(sameData(a, b)).toBe(canonical(a) === canonical(b))
			}),
			RUNS,
		)
	})

	it('is reflexive and symmetric, and ignores key order', () => {
		fc.assert(
			fc.property(pair, ([a, b]) => {
				expect(sameData(a, a)).toBe(true)
				expect(sameData(a, reversed(a))).toBe(true)
				expect(sameData(a, b)).toBe(sameData(b, a))
			}),
			RUNS,
		)
	})
})

describe('applyPatch', () => {
	it('changes nothing for an empty patch, nor for a patch of the values themselves', () => {
		fc.assert(
			fc.property(record, (value) => {
				expect(applyPatch(value, {})).toBe(value)
				expect(applyPatch(value, value as Patch<typeof value>)).toBe(value)
			}),
			RUNS,
		)
	})

	it('changes nothing when applied again', () => {
		fc.assert(
			fc.property(record, record, (value, patch) => {
				const once = applyPatch(value, patch)
				expect(applyPatch(once, patch)).toBe(once)
			}),
			RUNS,
		)
	})

	it('sets what the patch reaches and keeps the rest, the same objects where unchanged', () => {
		fc.assert(
			fc.property(record, record, (value, patch) => {
				const before = structuredClone(value)
				const result = applyPatch(value, patch)
				for (const key of Object.keys({ ...value, ...patch })) {
					const current = value[key]
					const patched = patch[key]
					const nested = [current, patched].every(
						(field) =>
							typeof field === 'object' && field !== null && !Array.isArray(field),
					)
					if (!(key in patch)) expect(result[key]).toBe(current)
					else if (!nested) expect(result[key]).toBe(patched)
					else
						expect(result[key]).toEqual(
							applyPatch(
								current as Record<string, unknown>,
								patched as Patch<object>,
							),
						)
				}
				// The original is never changed.
				expect(value).toEqual(before)
			}),
			RUNS,
		)
	})

	it('leaves a field patched with undefined as it is', () => {
		fc.assert(
			fc.property(record, fc.constantFrom('a', 'b', 'c', 'd'), (value, key) => {
				expect(applyPatch(value, { [key]: undefined })).toBe(value)
			}),
			RUNS,
		)
	})
})
