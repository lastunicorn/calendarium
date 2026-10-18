import type { ReactNode } from 'react'
import styles from './Field.module.css'

interface FieldProps {
	label: string
	/** The form control, labelled by `label`. */
	children: ReactNode
}

/** A label stacked above its control; the shared frame of the text, number and select fields. */
export function Field({ label, children }: FieldProps) {
	return (
		<label className={styles.field}>
			{label}
			{children}
		</label>
	)
}
