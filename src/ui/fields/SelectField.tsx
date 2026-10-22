import type { ChangeEvent } from 'react'
import dropdown from './Dropdown.module.css'
import { DropdownArrow } from './DropdownArrow'
import { Field } from './Field'
import type { Option } from './options'
import type { Description } from './description'

interface SelectFieldProps<T extends string | number> {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	value: T
	options: readonly Option<T>[]
	onChange: (value: T) => void
}

/**
 * A select whose options carry typed values, so `onChange` needs no cast from the DOM string.
 * Drawn like the `ComboboxField`, with the browser's own arrow replaced by the shared one.
 */
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
				<div className={dropdown.box}>
					<select
						{...control}
						className={dropdown.control}
						value={value}
						onChange={handleSelectChange}
					>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<DropdownArrow />
				</div>
			)}
		</Field>
	)
}
