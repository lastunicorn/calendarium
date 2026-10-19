import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no IntersectionObserver, which `useOverflow` uses. jsdom doesn't lay pages out either,
// so a page that is never reported on screen (no overflow check) is all a test needs.
class NoopIntersectionObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return []
	}
}
globalThis.IntersectionObserver ??=
	NoopIntersectionObserver as unknown as typeof IntersectionObserver

afterEach(() => {
	cleanup()
	localStorage.clear()
})
