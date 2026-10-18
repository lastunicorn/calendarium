import type { ReactNode } from 'react'
import type { CalendarConfig } from '../../config/CalendarConfig'
import styles from './Section.module.css'

/** Props shared by the form sections: the config and a way to change some of its fields. */
export interface ConfigSectionProps {
	config: CalendarConfig
	onUpdate: (patch: Partial<CalendarConfig>) => void
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
