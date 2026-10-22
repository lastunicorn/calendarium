import { describe, expect, it } from 'vitest'
import { sameData } from './data'

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
