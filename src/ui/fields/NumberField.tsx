import { Field } from './Field'
import { NumberInput } from './NumberInput'

interface NumberFieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: string
	value: number
	min: number
	max: number
	step?: number
	isValid?: (value: number) => boolean
	onChange: (value: number) => void
}

export function NumberField({ label, description, ...inputProps }: NumberFieldProps) {
	return (
		<Field label={label} description={description}>
			{(control) => <NumberInput {...control} {...inputProps} />}
		</Field>
	)
}
