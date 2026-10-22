import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { APP_VERSION } from '../../workspace/version'
import styles from './Sidebar.module.css'
import { SIDEBAR_MIN_WIDTH } from '../../preferences/Preferences'

/** How far one arrow key press moves the sidebar's edge, in px. */
const KEYBOARD_STEP = 16

interface SidebarProps {
	/** The width the viewer last dragged it to, in px, from their preferences. */
	width: number
	onResize: (width: number) => void
	children: ReactNode
}

/** The widest the sidebar can be: half the window. */
function sidebarMaxWidth(): number {
	return Math.max(SIDEBAR_MIN_WIDTH, Math.floor(window.innerWidth / 2))
}

/** `width` rounded and kept between `SIDEBAR_MIN_WIDTH` and half the window. */
function clampWidth(width: number): number {
	return Math.min(Math.max(Math.round(width), SIDEBAR_MIN_WIDTH), sidebarMaxWidth())
}

function handleHandlePointerDown(event: PointerEvent<HTMLDivElement>) {
	// Captured, so the drag keeps going when the pointer outruns the handle; no text selection.
	event.preventDefault()
	event.currentTarget.setPointerCapture(event.pointerId)
}

/**
 * The left-hand panel with the app heading, resizable from its right edge, kept between
 * `SIDEBAR_MIN_WIDTH` and half the window; hidden when printing.
 */
export function Sidebar({ width: preferredWidth, onResize, children }: SidebarProps) {
	const width = clampWidth(preferredWidth)

	function handleHandlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
		// The sidebar starts at the window's left edge, so the pointer's x is the new width.
		onResize(clampWidth(event.clientX))
	}

	function handleHandleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'ArrowLeft') onResize(clampWidth(width - KEYBOARD_STEP))
		else if (event.key === 'ArrowRight') onResize(clampWidth(width + KEYBOARD_STEP))
		else return
		event.preventDefault()
	}

	return (
		<aside className={styles.sidebar} style={{ width, minWidth: SIDEBAR_MIN_WIDTH }}>
			<h1 className={styles.heading}>
				Calendarium <span className={styles.version}>v{APP_VERSION}</span>
			</h1>
			{children}
			<div
				className={styles.resizeHandle}
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize sidebar"
				aria-valuenow={width}
				aria-valuemin={SIDEBAR_MIN_WIDTH}
				aria-valuemax={sidebarMaxWidth()}
				tabIndex={0}
				onPointerDown={handleHandlePointerDown}
				onPointerMove={handleHandlePointerMove}
				onKeyDown={handleHandleKeyDown}
			/>
		</aside>
	)
}
