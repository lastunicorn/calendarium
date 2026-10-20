import type { ChangeEvent } from 'react'
import { Field } from './Field'

interface TextFieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: string
	value: string
	placeholder?: string
	onChange: (value: string) => void
}

export function TextField({ label, description, value, placeholder, onChange }: TextFieldProps) {
	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.value)
	}

	return (
		<Field label={label} description={description}>
			{(control) => (
				<input
					{...control}
					type="text"
					value={value}
					placeholder={placeholder}
					onChange={handleInputChange}
				/>
			)}
		</Field>
	)
}
