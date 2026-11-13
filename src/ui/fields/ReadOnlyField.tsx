import { useId } from 'react'

import fieldStyles from './Field.module.css'
import styles from './ReadOnlyField.module.css'

interface ReadOnlyFieldProps {
	label: string
	value: string
}

/** A value shown under its label like a field's control, but read, not edited: it wraps instead of scrolling. */
export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
	const labelId = useId()

	return (
		<div className={fieldStyles.field}>
			<span className={fieldStyles.label} id={labelId}>
				{label}
			</span>
			<p className={styles.value} aria-labelledby={labelId}>
				{value}
			</p>
		</div>
	)
}
