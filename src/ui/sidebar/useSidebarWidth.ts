import { useEffect, useRef, useState } from 'react'

/** The sidebar's default width, and the narrowest it can be dragged to, in px. */
export const SIDEBAR_MIN_WIDTH = 320

const STORAGE_KEY = 'calendarium-sidebar-width'

/** The widest the sidebar can be: half the window. */
export function sidebarMaxWidth(): number {
	return Math.max(SIDEBAR_MIN_WIDTH, Math.floor(window.innerWidth / 2))
}

function clampWidth(width: number): number {
	return Math.min(Math.max(Math.round(width), SIDEBAR_MIN_WIDTH), sidebarMaxWidth())
}

function loadWidth(): number {
	try {
		const stored = Number(localStorage.getItem(STORAGE_KEY))
		return Number.isFinite(stored) ? clampWidth(stored) : SIDEBAR_MIN_WIDTH
	} catch {
		return SIDEBAR_MIN_WIDTH
	}
}

/**
 * The sidebar's width, chosen by dragging its edge, kept between `SIDEBAR_MIN_WIDTH` and half the
 * window and remembered in `localStorage` (a viewer preference, not part of the workspace).
 */
export function useSidebarWidth(): [number, (width: number) => void] {
	const [width, setWidth] = useState(loadWidth)
	// Saved only after a change, so merely opening the app writes nothing.
	const saved = useRef(width)

	useEffect(() => {
		if (width === saved.current) return
		saved.current = width
		try {
			localStorage.setItem(STORAGE_KEY, String(width))
		} catch {
			// Storage may be unavailable (private mode, quota); the width then resets on reload.
		}
	}, [width])

	function resize(next: number) {
		setWidth(clampWidth(next))
	}

	return [width, resize]
}
