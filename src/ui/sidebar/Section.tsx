import { type ReactNode, useId } from 'react'
import { Balloon } from '../components/Balloon'
import { ChevronIcon, ResetIcon } from '../components/icons'
import styles from './Section.module.css'
import { useOpenSectionsContext } from './useOpenSections'

/**
 * Props shared by groups of fields: a layout's options, or the part of them the fields edit, and a
 * way to change some of their fields.
 */
export interface ConfigFieldsProps<C> {
	config: C
	onUpdate: (patch: Partial<C>) => void
}

/** Props shared by the form sections: their fields' props and the defaults their reset restores. */
export interface ConfigSectionProps<C> extends ConfigFieldsProps<C> {
	/** The layout's default options, or of the part the section edits. */
	defaults: C
}

interface SectionProps {
	title: string
	/** A small decorative icon shown before the title. */
	icon: ReactNode
	/** A short note shown under the title, in a smaller, dimmer font. */
	description?: string
	/** Whether clicking the title hides the fields; when false, the section is always open. */
	collapsible?: boolean
	/** Restores the section's fields to their defaults, from a button under them, once confirmed in a balloon. */
	onReset?: () => void
	children: ReactNode
}

/**
 * A titled group of related fields, its title on a tinted band after an icon, optionally with a
 * short description under the title. A collapsible section starts collapsed: clicking the title
 * shows or hides the fields, closing any other open section, and the `ConfigForm` remembers which
 * one is open, by title. With `onReset`, an open section ends with a small reset button on the right, styled like a
 * field's info button, whose balloon asks before resetting.
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
	const resetBalloonId = useId()
	const openSections = useOpenSectionsContext()
	const expanded = !collapsible || openSections.isOpen(title)

	function handleTitleClick() {
		openSections.toggle(title)
	}

	return (
		<fieldset
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
						popoverTarget={resetBalloonId}
					>
						<ResetIcon />
					</button>
					<Balloon id={resetBalloonId}>
						<p className={styles.resetQuestion}>
							Reset {title} settings to their defaults?
						</p>
						<div className={styles.resetActions}>
							<button
								type="button"
								popoverTarget={resetBalloonId}
								popoverTargetAction="hide"
								onClick={onReset}
							>
								Reset
							</button>
						</div>
					</Balloon>
				</div>
			)}
		</fieldset>
	)
}
