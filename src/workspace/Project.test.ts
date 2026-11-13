import { describe, expect, it, vi } from 'vitest'

import { isProjectId, newProjectId } from './Project'

describe('isProjectId', () => {
	it('accepts a lowercase v4 UUID', () => {
		expect(isProjectId('3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10')).toBe(true)
	})

	it('rejects anything else', () => {
		const ids = [
			'3F0C9A52-7D1E-4B8A-9C61-2E5F4A8B7D10',
			'3f0c9a52-7d1e-1b8a-9c61-2e5f4a8b7d10',
			'3f0c9a52-7d1e-4b8a-7c61-2e5f4a8b7d10',
			'3f0c9a527d1e4b8a9c612e5f4a8b7d10',
			' 3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10',
			'',
			42,
			null,
			undefined,
		]
		for (const id of ids) expect(isProjectId(id), String(id)).toBe(false)
	})
})

describe('newProjectId', () => {
	it('builds a new project id each time, without `crypto.randomUUID`', () => {
		const randomUUID = vi.spyOn(crypto, 'randomUUID')
		const ids = Array.from({ length: 100 }, newProjectId)
		for (const id of ids) expect(isProjectId(id), id).toBe(true)
		expect(new Set(ids).size).toBe(ids.length)
		expect(randomUUID).not.toHaveBeenCalled()
		randomUUID.mockRestore()
	})
})
