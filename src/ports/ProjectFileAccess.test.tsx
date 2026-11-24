import { afterEach, describe, expect, it, vi } from 'vitest'

import { BROWSER_PROJECT_FILES } from './ProjectFileAccess'

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('BROWSER_PROJECT_FILES', () => {
	it('reads a chosen file of up to maxBytes bytes', async () => {
		const file = new File(['{"a":1}'], 'desk.json')
		expect(await BROWSER_PROJECT_FILES.read(file, 7)).toEqual({
			ok: true,
			name: 'desk.json',
			text: '{"a":1}',
		})
	})

	it('refuses a larger file unread', async () => {
		const file = new File(['{"a":12}'], 'desk.json')
		const text = vi.spyOn(file, 'text')
		expect(await BROWSER_PROJECT_FILES.read(file, 7)).toEqual({ ok: false, reason: 'tooLarge' })
		expect(text).not.toHaveBeenCalled()
	})

	it('saves a file through the browser’s download, then lets go of its URL', async () => {
		vi.useFakeTimers()
		const createObjectURL = vi.fn((_blob: Blob) => 'blob:desk')
		const revokeObjectURL = vi.fn()
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

		BROWSER_PROJECT_FILES.save('desk.json', '{"a":1}')
		expect(click).toHaveBeenCalledOnce()
		expect(click.mock.contexts[0]).toMatchObject({ download: 'desk.json', href: 'blob:desk' })
		const blob = createObjectURL.mock.calls[0][0]
		expect(blob.type).toBe('application/json')
		expect(await blob.text()).toBe('{"a":1}')
		// Not at once, which can cancel the download in some browsers.
		expect(revokeObjectURL).not.toHaveBeenCalled()
		vi.runAllTimers()
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:desk')
	})
})
