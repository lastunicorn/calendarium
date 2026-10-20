import { type ReactNode, type ToggleEvent, useEffect, useRef, useState } from 'react'
import styles from './Balloon.module.css'

/** Room kept between the balloon and the window's edges, in px. */
const VIEWPORT_GUTTER = 8

/** Room between the balloon and its button, which the arrow spans, in px. */
const ANCHOR_GAP = 8

interface BalloonProps {
	id: string
	children: ReactNode
}

/**
 * A popover above the button that opens it (one with `popoverTarget={id}`), pointing at it.
 * It sits in the top layer, so the scrolling form doesn't clip it; a click elsewhere or Escape
 * closes it, and so does a scroll or a resize, which would leave it behind the button.
 */
export function Balloon({ id, children }: BalloonProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)

	function handleBalloonToggle(event: ToggleEvent<HTMLDivElement>) {
		const balloon = event.currentTarget
		const isOpen = event.newState === 'open'
		setOpen(isOpen)
		if (!isOpen) return
		const button = document.querySelector(`[popovertarget="${CSS.escape(id)}"]`)
		if (button === null) return
		const anchor = button.getBoundingClientRect()
		const anchorCenter = anchor.left + anchor.width / 2
		const maxLeft = window.innerWidth - balloon.offsetWidth - VIEWPORT_GUTTER
		const left = Math.max(
			VIEWPORT_GUTTER,
			Math.min(anchorCenter - balloon.offsetWidth / 2, maxLeft),
		)
		balloon.style.top = `${anchor.top - balloon.offsetHeight - ANCHOR_GAP}px`
		balloon.style.left = `${left}px`
		balloon.style.setProperty('--arrow-left', `${anchorCenter - left}px`)
	}

	useEffect(() => {
		if (!open) return
		function close() {
			ref.current?.hidePopover()
		}
		window.addEventListener('scroll', close, { capture: true, passive: true })
		window.addEventListener('resize', close)
		return () => {
			window.removeEventListener('scroll', close, { capture: true })
			window.removeEventListener('resize', close)
		}
	}, [open])

	return (
		<div
			ref={ref}
			id={id}
			popover="auto"
			className={styles.balloon}
			onToggle={handleBalloonToggle}
		>
			{children}
		</div>
	)
}
