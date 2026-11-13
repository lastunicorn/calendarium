import { describe, expect, it } from 'vitest'

import {
	GESTURE_PAUSE,
	LINE_PX,
	nextWheelGesture,
	shortcutZoom,
	wheelDeltaPx,
	type ZoomKey,
} from './zoomGestures'

const PIXEL = 0
const LINE = 1
const PAGE = 2

describe('wheelDeltaPx', () => {
	it('keeps a delta in px as it is', () => {
		expect(wheelDeltaPx({ deltaY: -120, deltaMode: PIXEL }, 800)).toBe(-120)
	})

	it('counts a line as LINE_PX', () => {
		expect(wheelDeltaPx({ deltaY: 3, deltaMode: LINE }, 800)).toBe(3 * LINE_PX)
	})

	it('counts a page as the page’s height', () => {
		expect(wheelDeltaPx({ deltaY: -1, deltaMode: PAGE }, 800)).toBe(-800)
	})
})

describe('nextWheelGesture', () => {
	it('starts from the zoom drawn, zooming in when the wheel turns up', () => {
		const gesture = nextWheelGesture(null, 1000, -100, 1)
		expect(gesture.time).toBe(1000)
		expect(gesture.scale).toBeCloseTo(Math.exp(0.2))
	})

	it('zooms out when the wheel turns down, by as much as it zooms in', () => {
		const zoomIn = nextWheelGesture(null, 0, -100, 1)
		const zoomOut = nextWheelGesture(null, 0, 100, 1)
		expect(zoomIn.scale * zoomOut.scale).toBeCloseTo(1)
	})

	it('goes on from where the gesture came to while events keep coming', () => {
		const last = { scale: 1.5, time: 1000 }
		const gesture = nextWheelGesture(last, 1000 + GESTURE_PAUSE - 1, 0, 1)
		expect(gesture.scale).toBe(1.5)
	})

	it('starts again from the zoom drawn after a pause', () => {
		const last = { scale: 1.5, time: 1000 }
		const gesture = nextWheelGesture(last, 1000 + GESTURE_PAUSE, 0, 1)
		expect(gesture.scale).toBe(1)
	})

	it('adds up a pinch’s small steps, unrounded', () => {
		let gesture = nextWheelGesture(null, 0, -1, 1)
		for (let time = 10; time < 100; time += 10) {
			gesture = nextWheelGesture(gesture, time, -1, 1)
		}
		expect(gesture.scale).toBeCloseTo(Math.exp(0.02))
	})

	it('stays between the lowest and the highest zooms', () => {
		expect(nextWheelGesture(null, 0, -10_000, 1).scale).toBe(2)
		expect(nextWheelGesture(null, 0, 10_000, 1).scale).toBe(0.25)
	})
})

describe('shortcutZoom', () => {
	function key(key: string, modifiers: Partial<ZoomKey> = { ctrlKey: true }): ZoomKey {
		return { key, ctrlKey: false, metaKey: false, altKey: false, ...modifiers }
	}

	it('zooms a level in with + or =, a level out with − or _', () => {
		expect(shortcutZoom(key('+'), 1)).toBe(125)
		expect(shortcutZoom(key('='), 1)).toBe(125)
		expect(shortcutZoom(key('-'), 1)).toBe(75)
		expect(shortcutZoom(key('_'), 1)).toBe(75)
	})

	it('goes to the printed size with 0', () => {
		expect(shortcutZoom(key('0'), 0.5)).toBe(100)
	})

	it('steps from a fit’s scale to the next level', () => {
		expect(shortcutZoom(key('+'), 0.9)).toBe(100)
		expect(shortcutZoom(key('-'), 0.9)).toBe(75)
	})

	it('goes nowhere past the last level', () => {
		expect(shortcutZoom(key('+'), 2)).toBeNull()
		expect(shortcutZoom(key('-'), 0.25)).toBeNull()
	})

	it('takes ⌘ as Ctrl', () => {
		expect(shortcutZoom(key('+', { metaKey: true }), 1)).toBe(125)
	})

	it('leaves alone a key without Ctrl or ⌘, with Alt, or another key', () => {
		expect(shortcutZoom(key('+', {}), 1)).toBeUndefined()
		expect(shortcutZoom(key('+', { ctrlKey: true, altKey: true }), 1)).toBeUndefined()
		expect(shortcutZoom(key('a'), 1)).toBeUndefined()
	})
})
