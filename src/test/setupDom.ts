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

// Nor ResizeObserver, which the preview follows its size with; jsdom's elements have none anyway.
class NoopResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver

// Nor scrollIntoView, which `ComboboxField` keeps its active option in view with.
Element.prototype.scrollIntoView ??= function () {}

afterEach(() => {
	cleanup()
	localStorage.clear()
})
