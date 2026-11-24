import { afterEach, describe, expect, it, vi } from 'vitest'

import { BROWSER_ENVIRONMENT } from './EnvironmentAccess'

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

describe('BROWSER_ENVIRONMENT', () => {
	it('gives this year by the system clock', () => {
		vi.useFakeTimers({ now: new Date(2031, 5, 15, 12) })
		expect(BROWSER_ENVIRONMENT.current().year).toBe(2031)
	})

	it('gives the year where the user is, in the system’s time zone', () => {
		vi.useFakeTimers({ now: new Date(2030, 11, 31, 23, 30) })
		expect(BROWSER_ENVIRONMENT.current().year).toBe(2030)
	})

	it('gives the language the browser is set to', () => {
		vi.stubGlobal('navigator', { language: 'fr-CA' })
		expect(BROWSER_ENVIRONMENT.current().language).toBe('fr-CA')
	})

	it('gives no language outside a browser', () => {
		vi.stubGlobal('navigator', undefined)
		expect(BROWSER_ENVIRONMENT.current().language).toBeUndefined()
	})
})
