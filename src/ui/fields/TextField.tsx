import type { ChangeEvent } from 'react'
import { Field } from './Field'

interface TextFieldProps {
	label: string
	value: string
	placeholder?: string
	onChange: (value: string) => void
}

export function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.value)
	}

	return (
		<Field label={label}>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={handleInputChange}
			/>
		</Field>
	)
}
