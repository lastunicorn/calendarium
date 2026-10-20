import { type ChangeEvent, type ToggleEvent, useEffect, useId, useRef, useState } from 'react'
import { InfoIcon } from '../components/icons'
import styles from './RadioField.module.css'
import type { Option } from './options'

interface RadioFieldProps<T extends string | number> {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: string
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}

/** A group of radio buttons whose options carry typed values, like `SelectField` for short lists. */
export function RadioField<T extends string | number>({
	label,
	description,
	value,
	options,
	onChange,
}: RadioFieldProps<T>) {
	const name = useId()
	const balloonId = useId()

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		// Each radio carries its index in `options`, which maps back to a typed value.
		onChange(options[Number(event.currentTarget.dataset.index)].value)
	}

	return (
		<fieldset
			className={styles.field}
			aria-describedby={description === undefined ? undefined : balloonId}
		>
			<legend className={styles.legend}>
				{label}
				{description !== undefined && (
					<button
						type="button"
						className={styles.infoButton}
						popoverTarget={balloonId}
						aria-label={`About ${label}`}
					>
						<InfoIcon />
					</button>
				)}
			</legend>
			{description !== undefined && <Balloon id={balloonId}>{description}</Balloon>}
			{options.map((option, index) => (
				<label key={option.value} className={styles.option}>
					<input
						type="radio"
						name={name}
						checked={option.value === value}
						data-index={index}
						onChange={handleInputChange}
					/>
					{option.label}
				</label>
			))}
		</fieldset>
	)
}

/** Room kept between the balloon and the window's edges, in px. */
const VIEWPORT_GUTTER = 8

/** Room between the balloon and its button, which the arrow spans, in px. */
const ANCHOR_GAP = 8

interface BalloonProps {
	id: string
	children: string
}

/**
 * A popover above the button that opens it (`popoverTarget={id}`), pointing at it. It sits in the
 * top layer, so the scrolling form doesn't clip it; a click elsewhere or Escape closes it, and so
 * does a scroll or a resize, which would leave it behind the button.
 */
function Balloon({ id, children }: BalloonProps) {
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
