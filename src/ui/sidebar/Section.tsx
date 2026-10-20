import { type ReactNode, useId } from 'react'
import { ChevronIcon } from '../components/icons'
import styles from './Section.module.css'
import { useOpenSectionsContext } from './useOpenSections'

/**
 * Props shared by the form sections: a layout's options, or the part of them the section edits,
 * and a way to change some of their fields.
 */
export interface ConfigSectionProps<C> {
	config: C
	onUpdate: (patch: Partial<C>) => void
}

interface SectionProps {
	title: string
	/** A small decorative icon shown before the title. */
	icon: ReactNode
	/** A short note shown under the title, in a smaller, dimmer font. */
	description?: string
	children: ReactNode
}

/**
 * A titled group of related fields, its title on a tinted band after an icon, optionally with a
 * short description under the title. It starts collapsed: clicking the title shows or hides the
 * fields, and the `ConfigForm` remembers which sections are open, by title.
 */
export function Section({ title, icon, description, children }: SectionProps) {
	const descriptionId = useId()
	const openSections = useOpenSectionsContext()
	const expanded = openSections.isOpen(title)

	function handleTitleClick() {
		openSections.toggle(title)
	}

	return (
		<fieldset
			className={`${styles.section} ${expanded ? styles.open : ''}`}
			aria-describedby={description === undefined || !expanded ? undefined : descriptionId}
		>
			<legend className={styles.title}>
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
			</legend>
			{expanded && description !== undefined && (
				<p id={descriptionId} className={styles.description}>
					{description}
				</p>
			)}
			{expanded && children}
		</fieldset>
	)
}
