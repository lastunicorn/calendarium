import { type ChangeEvent, useId } from 'react'
import styles from './CheckboxField.module.css'
import { InfoBalloon, InfoButton } from './Info'
import type { Description } from './description'

interface CheckboxFieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	checked: boolean
	disabled?: boolean
	onChange: (checked: boolean) => void
}

export function CheckboxField({
	label,
	description,
	checked,
	disabled = false,
	onChange,
}: CheckboxFieldProps) {
	const balloonId = useId()

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.checked)
	}

	return (
		<div className={styles.field}>
			<label className={disabled ? `${styles.checkbox} ${styles.disabled}` : styles.checkbox}>
				<input
					type="checkbox"
					checked={checked}
					disabled={disabled}
					aria-describedby={description === undefined ? undefined : balloonId}
					onChange={handleInputChange}
				/>
				{label}
			</label>
			{description !== undefined && (
				<>
					<InfoButton balloonId={balloonId} label={label} />
					<InfoBalloon id={balloonId}>{description}</InfoBalloon>
				</>
			)}
		</div>
	)
}
