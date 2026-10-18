import { Field } from './Field'
import { NumberInput } from './NumberInput'

interface NumberFieldProps {
	label: string
	value: number
	min: number
	max: number
	step?: number
	isValid?: (value: number) => boolean
	onChange: (value: number) => void
}

export function NumberField({ label, ...inputProps }: NumberFieldProps) {
	return (
		<Field label={label}>
			<NumberInput {...inputProps} />
		</Field>
	)
}
