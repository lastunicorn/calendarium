import { type RefObject, useEffect, useEffectEvent, useRef } from 'react'
import {
	DEFAULT_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	type PreviewZoom,
	zoomAt,
	zoomedIn,
	zoomedOut,
} from '../../preferences/zoom'

/** A point on screen, in px from the window's top left corner. */
export interface ScreenPoint {
	x: number
	y: number
}

/** How much a px of wheel delta zooms: a mouse wheel's notch, about 100 px, by a fifth or so. */
const ZOOM_PER_PX = 0.002

/** The longest pause between a gesture's wheel events, in ms; a longer one starts another gesture. */
const GESTURE_PAUSE = 250

/** Where a wheel gesture has come to, unrounded, so that a pinch's many small steps add up. */
interface WheelGesture {
	scale: number
	/** When its last event came, `Event.timeStamp`. */
	time: number
}

/** The px a line of wheel delta stands for, as Firefox counts a mouse wheel's notches in lines. */
const LINE_PX = 33

/** The wheel's vertical delta in px, whatever unit it came in. */
function wheelDeltaPx(event: WheelEvent): number {
	if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_PX
	if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
	return event.deltaY
}

/**
 * The zoom a keyboard shortcut goes to: Ctrl (or ⌘) with + (or =) a level in, with − a level out,
 * with 0 the printed size; `null` past the last level, `undefined` for any other key.
 */
function shortcutZoom(event: KeyboardEvent, scale: number): PreviewZoom | null | undefined {
	if (!(event.ctrlKey || event.metaKey) || event.altKey) return undefined
	if (event.key === '+' || event.key === '=') return zoomedIn(scale)
	if (event.key === '-' || event.key === '_') return zoomedOut(scale)
	if (event.key === '0') return DEFAULT_ZOOM
	return undefined
}

/**
 * Zooms the preview from the keyboard and the wheel while over or inside `areaRef`, in place of
 * the browser zooming the whole app: Ctrl (or ⌘) with +, − or 0 (`shortcutZoom`), and Ctrl (or ⌘)
 * with the wheel, which is also what a trackpad's pinch sends, smoothly through every percent
 * around the pointer.
 */
export function useZoomGestures(
	areaRef: RefObject<HTMLElement | null>,
	scale: number,
	onZoom: (zoom: PreviewZoom, point?: ScreenPoint) => void,
) {
	const gesture = useRef<WheelGesture | null>(null)

	const handleWheel = useEffectEvent((event: WheelEvent) => {
		if (!(event.ctrlKey || event.metaKey)) return
		event.preventDefault()
		// Goes on from where the gesture came to, ahead of the zoom drawn when events come faster
		// than the preview redraws; a new gesture starts from the zoom drawn.
		const last = gesture.current
		const from =
			last !== null && event.timeStamp - last.time < GESTURE_PAUSE ? last.scale : scale
		const zoomed = from * Math.exp(-wheelDeltaPx(event) * ZOOM_PER_PX)
		const next = Math.min(Math.max(zoomed, MIN_ZOOM / 100), MAX_ZOOM / 100)
		gesture.current = { scale: next, time: event.timeStamp }
		onZoom(zoomAt(next), { x: event.clientX, y: event.clientY })
	})

	const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
		const zoom = shortcutZoom(event, scale)
		if (zoom === undefined) return
		event.preventDefault()
		if (zoom !== null) onZoom(zoom)
	})

	useEffect(() => {
		const area = areaRef.current
		if (area === null) return
		// Not passive, so the browser's own zoom can be prevented.
		area.addEventListener('wheel', handleWheel, { passive: false })
		area.addEventListener('keydown', handleKeyDown)
		return () => {
			area.removeEventListener('wheel', handleWheel)
			area.removeEventListener('keydown', handleKeyDown)
		}
	}, [areaRef])
}
