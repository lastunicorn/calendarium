import type { ReactNode } from 'react'
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
	children: ReactNode
}

/** A titled group of related fields. */
export function Section({ title, children }: SectionProps) {
	return (
		<fieldset className={styles.section}>
			<legend className={styles.title}>{title}</legend>
			{children}
		</fieldset>
	)
}
