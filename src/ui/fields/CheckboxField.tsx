import type { ChangeEvent } from 'react'
import styles from './CheckboxField.module.css'

interface CheckboxFieldProps {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.checked)
	}

	return (
		<label className={styles.checkbox}>
			<input type="checkbox" checked={checked} onChange={handleInputChange} />
			{label}
		</label>
	)
}
