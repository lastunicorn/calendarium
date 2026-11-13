import { useEffect, useEffectEvent, useRef, type RefObject } from 'react'

import { zoomAt, type PreviewZoom } from '../../preferences/zoom'
import { nextWheelGesture, shortcutZoom, wheelDeltaPx, type WheelGesture } from './zoomGestures'

/** A point on screen, in px from the window's top left corner. */
export interface ScreenPoint {
	x: number
	y: number
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
		const next = nextWheelGesture(
			gesture.current,
			event.timeStamp,
			wheelDeltaPx(event, window.innerHeight),
			scale,
		)
		gesture.current = next
		onZoom(zoomAt(next.scale), { x: event.clientX, y: event.clientY })
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
