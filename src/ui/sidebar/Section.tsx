import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { ChevronIcon, ResetIcon } from '../components/icons'
import styles from './Section.module.css'
import { useOpenSectionsContext } from './useOpenSections'

/**
 * Props shared by groups of fields: a layout's options, or the part of them the fields edit, and a
 * way to change some of their fields.
 */
export interface OptionsFieldsProps<O> {
	options: O
	onUpdate: (patch: Partial<O>) => void
}

/** Props shared by the form sections: their fields' props and the defaults their reset restores. */
export interface OptionsSectionProps<O> extends OptionsFieldsProps<O> {
	/** The layout's default options, or of the part the section edits. */
	defaults: O
}

interface SectionProps {
	title: string
	/** A small decorative icon shown before the title. */
	icon: ReactNode
	/** A short note shown under the title, in a smaller, dimmer font. */
	description?: string
	/** Whether clicking the title hides the fields; when false, the section is always open. */
	collapsible?: boolean
	/** Restores the section's fields to their defaults, from a button under them, once confirmed. */
	onReset?: () => void
	children: ReactNode
}

/**
 * A titled group of related fields, its title on a tinted band after an icon, optionally with a
 * short description under the title. A collapsible section starts collapsed: clicking the title
 * shows or hides the fields, closing any other open section, and the `WorkspaceForm` remembers which
 * one is open, by title. With `onReset`, an open section ends with a small reset button on the
 * right, styled like a field's info button. It covers the fields with a veil asking to confirm,
 * which keeps them out of reach; a click outside the section, Escape or collapsing the section
 * cancels.
 */
export function Section({
	title,
	icon,
	description,
	collapsible = true,
	onReset,
	children,
}: SectionProps) {
	const descriptionId = useId()
	const questionId = useId()
	const section = useRef<HTMLFieldSetElement>(null)
	const [confirmingReset, setConfirmingReset] = useState(false)
	const openSections = useOpenSectionsContext()
	const expanded = !collapsible || openSections.isOpen(title)

	// Collapsing the section, e.g. by opening another one, cancels its reset.
	if (confirmingReset && !expanded) setConfirmingReset(false)

	useEffect(() => {
		if (!confirmingReset) return
		function handleDocumentPointerDown(event: PointerEvent) {
			if (!section.current?.contains(event.target as Node)) setConfirmingReset(false)
		}
		function handleDocumentKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setConfirmingReset(false)
		}
		document.addEventListener('pointerdown', handleDocumentPointerDown, true)
		document.addEventListener('keydown', handleDocumentKeyDown)
		return () => {
			document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
			document.removeEventListener('keydown', handleDocumentKeyDown)
		}
	}, [confirmingReset])

	function handleTitleClick() {
		openSections.toggle(title)
	}

	function handleResetClick() {
		setConfirmingReset(true)
	}

	function handleResetConfirmClick() {
		setConfirmingReset(false)
		onReset?.()
	}

	return (
		<fieldset
			ref={section}
			className={`${styles.section} ${expanded ? styles.open : ''}`}
			aria-describedby={description === undefined || !expanded ? undefined : descriptionId}
		>
			<legend className={styles.title}>
				{collapsible ? (
					<button
						type="button"
						className={styles.toggle}
						aria-expanded={expanded}
						onClick={handleTitleClick}
					>
						{icon}
						{title}
						<span className={styles.chevron}>
							<ChevronIcon />
						</span>
					</button>
				) : (
					<span className={styles.heading}>
						{icon}
						{title}
					</span>
				)}
			</legend>
			{/* Holds no box of its own, so the fields stay spaced by the section. */}
			<div className={styles.body} inert={confirmingReset}>
				{expanded && description !== undefined && (
					<p id={descriptionId} className={styles.description}>
						{description}
					</p>
				)}
				{expanded && children}
				{expanded && onReset && (
					<div className={styles.footer}>
						<button
							type="button"
							className={styles.reset}
							title={`Reset ${title} settings`}
							aria-label={`Reset ${title} settings`}
							onClick={handleResetClick}
						>
							<ResetIcon />
						</button>
					</div>
				)}
			</div>
			{confirmingReset && (
				<div className={styles.veil} role="alertdialog" aria-labelledby={questionId}>
					<p id={questionId} className={styles.resetQuestion}>
						Reset {title} settings to their defaults?
					</p>
					<button type="button" autoFocus onClick={handleResetConfirmClick}>
						Reset
					</button>
				</div>
			)}
		</fieldset>
	)
}
