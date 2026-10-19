import { type ReactNode, useId } from 'react'
import styles from './Section.module.css'

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
	/** A short note shown under the title, in a smaller, dimmer font. */
	description?: string
	children: ReactNode
}

/** A titled group of related fields, optionally with a short description under the title. */
export function Section({ title, description, children }: SectionProps) {
	const descriptionId = useId()

	return (
		<fieldset
			className={styles.section}
			aria-describedby={description === undefined ? undefined : descriptionId}
		>
			<legend className={styles.title}>{title}</legend>
			{description !== undefined && (
				<p id={descriptionId} className={styles.description}>
					{description}
				</p>
			)}
			{children}
		</fieldset>
	)
}
