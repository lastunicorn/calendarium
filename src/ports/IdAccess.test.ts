import { afterEach, describe, expect, it, vi } from 'vitest'

import { BROWSER_IDS } from './IdAccess'

/** A v4 UUID, in lowercase. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => {
	vi.restoreAllMocks()
})

describe('BROWSER_IDS', () => {
	it('makes a new lowercase v4 UUID each time, without `crypto.randomUUID`', () => {
		const randomUUID = vi.spyOn(crypto, 'randomUUID')
		const ids = Array.from({ length: 100 }, BROWSER_IDS.newId)
		for (const id of ids) expect(id).toMatch(UUID)
		expect(new Set(ids).size).toBe(ids.length)
		expect(randomUUID).not.toHaveBeenCalled()
	})

	it('sets the version and variant bits whatever the random bytes', () => {
		vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
			if (array instanceof Uint8Array) array.fill(0xff)
			return array
		})
		expect(BROWSER_IDS.newId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff')
	})
})
