import { afterEach, describe, expect, it, vi } from 'vitest'

import { BROWSER_PRINTER } from './PrinterAccess'

afterEach(() => {
	vi.restoreAllMocks()
})

describe('BROWSER_PRINTER', () => {
	it('opens the browser’s print dialog', () => {
		const print = vi.spyOn(window, 'print').mockImplementation(() => {})
		BROWSER_PRINTER.print()
		expect(print).toHaveBeenCalledOnce()
	})
})
