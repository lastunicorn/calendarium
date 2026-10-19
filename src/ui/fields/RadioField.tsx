import { type ChangeEvent, useId } from 'react'
import styles from './RadioField.module.css'
import type { Option } from './options'

interface RadioFieldProps<T extends string | number> {
	label: string
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}

/** A group of radio buttons whose options carry typed values, like `SelectField` for short lists. */
export function RadioField<T extends string | number>({
	label,
	value,
	options,
	onChange,
}: RadioFieldProps<T>) {
	const name = useId()

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		// Each radio carries its index in `options`, which maps back to a typed value.
		onChange(options[Number(event.currentTarget.dataset.index)].value)
	}

	return (
		<fieldset className={styles.field}>
			<legend className={styles.legend}>{label}</legend>
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
