import { type ChangeEvent, useId } from 'react'
import { InfoBalloon, InfoButton } from './Info'
import styles from './RadioField.module.css'
import type { Option } from './options'
import type { Description } from './description'

interface RadioFieldProps<T extends string | number> {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}

/** A group of radio buttons whose options carry typed values, like `SelectField` for short lists. */
export function RadioField<T extends string | number>({
	label,
	description,
	value,
	options,
	onChange,
}: RadioFieldProps<T>) {
	const name = useId()
	const balloonId = useId()

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		// Each radio carries its index in `options`, which maps back to a typed value.
		onChange(options[Number(event.currentTarget.dataset.index)].value)
	}

	return (
		<fieldset
			className={styles.field}
			aria-describedby={description === undefined ? undefined : balloonId}
		>
			<legend className={styles.legend}>
				{label}
				{description !== undefined && <InfoButton balloonId={balloonId} label={label} />}
			</legend>
			{description !== undefined && <InfoBalloon id={balloonId}>{description}</InfoBalloon>}
			{options.map((option, index) => (
				<label key={option.value} className={styles.option}>
					<input
						type="radio"
						name={name}
						checked={option.value === value}
						data-index={index}
						onChange={handleInputChange}
					/>
					{option.label}
				</label>
			))}
		</fieldset>
	)
}
