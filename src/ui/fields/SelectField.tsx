import type { ChangeEvent } from 'react'
import { Field } from './Field'
import type { Option } from './options'

interface SelectFieldProps<T extends string | number> {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: string
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}

/** A select whose options carry typed values, so `onChange` needs no cast from the DOM string. */
export function SelectField<T extends string | number>({
	label,
	description,
	value,
	options,
	onChange,
}: SelectFieldProps<T>) {
	function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
		// The <option>s are rendered from `options` in order, so the index maps back to a typed value.
		onChange(options[event.currentTarget.selectedIndex].value)
	}

	return (
		<Field label={label} description={description}>
			{(control) => (
				<select {...control} value={value} onChange={handleSelectChange}>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			)}
		</Field>
	)
}
