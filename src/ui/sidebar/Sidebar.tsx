import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { APP_VERSION } from '../../config/version'
import styles from './Sidebar.module.css'
import { SIDEBAR_MIN_WIDTH, sidebarMaxWidth, useSidebarWidth } from './useSidebarWidth'

/** How far one arrow key press moves the sidebar's edge, in px. */
const KEYBOARD_STEP = 16

interface SidebarProps {
	children: ReactNode
}

function handleHandlePointerDown(event: PointerEvent<HTMLDivElement>) {
	// Captured, so the drag keeps going when the pointer outruns the handle; no text selection.
	event.preventDefault()
	event.currentTarget.setPointerCapture(event.pointerId)
}

/** The left-hand panel with the app heading, resizable from its right edge; hidden when printing. */
export function Sidebar({ children }: SidebarProps) {
	const [width, setWidth] = useSidebarWidth()

	function handleHandlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
		// The sidebar starts at the window's left edge, so the pointer's x is the new width.
		setWidth(event.clientX)
	}

	function handleHandleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'ArrowLeft') setWidth(width - KEYBOARD_STEP)
		else if (event.key === 'ArrowRight') setWidth(width + KEYBOARD_STEP)
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
