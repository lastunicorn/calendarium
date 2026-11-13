import { describe, expect, it } from 'vitest'

import { copyValid, isBoolean, isString, isStringArray, type Validators } from './validation'

describe('isStringArray', () => {
	it('accepts arrays of strings, empty included', () => {
		expect(isStringArray([])).toBe(true)
		expect(isStringArray(['a', ''])).toBe(true)
	})

	it('rejects other values and arrays holding anything else', () => {
		for (const value of ['a', null, undefined, {}, ['a', 1], [null], [['a']]]) {
			expect(isStringArray(value)).toBe(false)
		}
	})
})

describe('copyValid', () => {
	interface Data {
		on: boolean
		lines: string[]
		nested: { name: string; tags: string[] }
	}

	const VALIDATORS: Validators<Data> = {
		on: isBoolean,
		lines: isStringArray,
		nested: { name: isString, tags: isStringArray },
	}

	function defaults(): Data {
		return { on: false, lines: [], nested: { name: '', tags: [] } }
	}

	it('copies an array field whole when it is valid', () => {
		const target = defaults()
		const ignored: string[] = []
		copyValid(target, { lines: ['a', 'b'], nested: { tags: ['c'] } }, VALIDATORS, ignored)
		expect(target).toEqual({ on: false, lines: ['a', 'b'], nested: { name: '', tags: ['c'] } })
		expect(ignored).toEqual([])
	})

	it('keeps the default and reports the path of an invalid array', () => {
		const target = defaults()
		const ignored: string[] = []
		copyValid(target, { lines: 'a', nested: { tags: [1] } }, VALIDATORS, ignored)
		expect(target).toEqual(defaults())
		expect(ignored).toEqual(['lines', 'nested.tags'])
	})
})
