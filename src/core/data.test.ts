import { describe, expect, it } from 'vitest'

import { applyPatch, sameData } from './data'

describe('applyPatch', () => {
	const value = { a: 1, b: { c: 2, d: { e: 3 } }, f: [1, 2], g: { h: 4 } }

	it('patches nested objects field by field, keeping the untouched branches', () => {
		const patched = applyPatch(value, { b: { d: { e: 5 } } })
		expect(patched).toEqual({ ...value, b: { c: 2, d: { e: 5 } } })
		expect(patched).not.toBe(value)
		expect(patched.g).toBe(value.g)
		expect(patched.f).toBe(value.f)
	})

	it('replaces arrays and other values whole', () => {
		const patched = applyPatch(value, { a: 9, f: [3] })
		expect(patched).toEqual({ ...value, a: 9, f: [3] })
		expect(patched.b).toBe(value.b)
	})

	it('returns the same object when the patch changes nothing', () => {
		expect(applyPatch(value, {})).toBe(value)
		expect(applyPatch(value, { a: 1, b: { d: { e: 3 } } })).toBe(value)
		expect(applyPatch(value, { a: undefined })).toBe(value)
	})

	it('leaves the value and the patch as they were', () => {
		const patch = { b: { c: 7 } }
		applyPatch(value, patch)
		expect(value.b.c).toBe(2)
		expect(patch).toEqual({ b: { c: 7 } })
	})
})

describe('sameData', () => {
	it('compares plain values by value', () => {
		expect(sameData(1, 1)).toBe(true)
		expect(sameData('a', 'a')).toBe(true)
		expect(sameData(null, null)).toBe(true)
		expect(sameData(1, '1')).toBe(false)
		expect(sameData(null, {})).toBe(false)
		expect(sameData(false, 0)).toBe(false)
	})

	it('compares nested objects field by field, whatever their key order', () => {
		expect(sameData({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toBe(true)
		expect(sameData({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false)
		expect(sameData([1, 2], [2, 1])).toBe(false)
	})

	it('tells apart objects with different fields', () => {
		expect(sameData({ a: 1 }, { a: 1, b: 2 })).toBe(false)
		expect(sameData({ a: undefined }, { b: undefined })).toBe(false)
		expect(sameData({ 0: 'a' }, ['a'])).toBe(false)
	})
})
