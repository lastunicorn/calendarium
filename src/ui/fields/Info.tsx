import { type ToggleEvent, useEffect, useRef, useState } from 'react'
import { InfoIcon } from '../components/icons'
import { type Description, descriptionParagraphs } from './description'
import styles from './Info.module.css'

interface InfoButtonProps {
	/** The id of the `InfoBalloon` it opens. */
	balloonId: string
	/** The label of the field the balloon describes. */
	label: string
}

/** The small info button placed after a field's label, opening that field's `InfoBalloon`. */
export function InfoButton({ balloonId, label }: InfoButtonProps) {
	return (
		<button
			type="button"
			className={styles.infoButton}
			popoverTarget={balloonId}
			aria-label={`About ${label}`}
		>
			<InfoIcon />
		</button>
	)
}

/** Room kept between the balloon and the window's edges, in px. */
const VIEWPORT_GUTTER = 8

/** Room between the balloon and its button, which the arrow spans, in px. */
const ANCHOR_GAP = 8

interface InfoBalloonProps {
	id: string
	/** What it says, each paragraph in its own `<p>`. */
	children: Description
}

/**
 * A popover above the button that opens it (`InfoButton` with `balloonId={id}`), pointing at it.
 * It sits in the top layer, so the scrolling form doesn't clip it; a click elsewhere or Escape
 * closes it, and so does a scroll or a resize, which would leave it behind the button.
 */
export function InfoBalloon({ id, children }: InfoBalloonProps) {
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
			{descriptionParagraphs(children).map((paragraph, index) => (
				<p key={index} className={styles.paragraph}>
					{paragraph}
				</p>
			))}
		</div>
	)
}
