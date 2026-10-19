import type { ReactNode } from 'react'
import styles from './Field.module.css'

interface FieldProps {
	label: string
	/** A short note shown under the control, in a smaller, dimmer font. */
	description?: string
	/** The form control, labelled by `label`. */
	children: ReactNode
}

/** A label stacked above its control; the shared frame of the text, number and select fields. */
export function Field({ label, description, children }: FieldProps) {
	return (
		<div className={styles.field}>
			<label className={styles.label}>
				{label}
				{children}
			</label>
			{description !== undefined && <p className={styles.description}>{description}</p>}
		</div>
	)
}
