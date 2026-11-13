import {
	DEFAULT_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	zoomedIn,
	zoomedOut,
	type PreviewZoom,
} from '../../preferences/zoom'

/** How much a px of wheel delta zooms: a mouse wheel's notch, about 100 px, by a fifth or so. */
const ZOOM_PER_PX = 0.002

/** The longest pause between a gesture's wheel events, in ms; a longer one starts another gesture. */
export const GESTURE_PAUSE = 250

/** The px a line of wheel delta stands for, as Firefox counts a mouse wheel's notches in lines. */
export const LINE_PX = 33

/** `WheelEvent.DOM_DELTA_LINE` and `DOM_DELTA_PAGE`, which only a browser defines. */
const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2

/** What a wheel event's zoom is worked out from. */
export type WheelDelta = Pick<WheelEvent, 'deltaY' | 'deltaMode'>

/** What a keyboard shortcut's zoom is worked out from. */
export type ZoomKey = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>

/** Where a wheel gesture has come to, unrounded, so that a pinch's many small steps add up. */
export interface WheelGesture {
	scale: number
	/** When its last event came, `Event.timeStamp`. */
	time: number
}

/** The wheel's vertical delta in px, whatever unit it came in, a page being `pageHeight` px. */
export function wheelDeltaPx({ deltaY, deltaMode }: WheelDelta, pageHeight: number): number {
	if (deltaMode === DOM_DELTA_LINE) return deltaY * LINE_PX
	if (deltaMode === DOM_DELTA_PAGE) return deltaY * pageHeight
	return deltaY
}

/**
 * Where a gesture goes on a wheel event at `time` turning `deltaPx`: on from where the gesture came
 * to, ahead of the zoom drawn when events come faster than the preview redraws, or, after a pause
 * (or with no gesture yet), from the zoom drawn, `scale`; kept between the lowest and the highest
 * zooms. The zoom to draw is `zoomAt(gesture.scale)`.
 */
export function nextWheelGesture(
	last: WheelGesture | null,
	time: number,
	deltaPx: number,
	scale: number,
): WheelGesture {
	const from = last !== null && time - last.time < GESTURE_PAUSE ? last.scale : scale
	const zoomed = from * Math.exp(-deltaPx * ZOOM_PER_PX)
	return { scale: Math.min(Math.max(zoomed, MIN_ZOOM / 100), MAX_ZOOM / 100), time }
}

/**
 * The zoom a keyboard shortcut goes to: Ctrl (or ⌘) with + (or =) a level in, with − a level out,
 * with 0 the printed size; `null` past the last level, `undefined` for any other key.
 */
export function shortcutZoom(event: ZoomKey, scale: number): PreviewZoom | null | undefined {
	if (!(event.ctrlKey || event.metaKey) || event.altKey) return undefined
	if (event.key === '+' || event.key === '=') return zoomedIn(scale)
	if (event.key === '-' || event.key === '_') return zoomedOut(scale)
	if (event.key === '0') return DEFAULT_ZOOM
	return undefined
}
