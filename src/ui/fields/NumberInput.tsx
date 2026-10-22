import { type ChangeEvent, useState } from 'react'

interface NumberInputProps {
	id?: string
	'aria-describedby'?: string
	value: number
	min: number
	max: number
	step?: number
	/** The input's accessible name, for an input that has no visible label. */
	label?: string
	/** Whether a typed number may be committed; defaults to finite and within `min`–`max`. */
	isValid?: (value: number) => boolean
	readOnly?: boolean
	onChange: (value: number) => void
}

/**
 * Controlled number input that keeps the text being typed as a draft, so the field can be
 * cleared or hold an intermediate value without snapping back. Only valid numbers reach
 * `onChange`; leaving the field shows the committed value again.
 */
export function NumberInput({
	id,
	'aria-describedby': describedBy,
	value,
	min,
	max,
	step,
	label,
	isValid,
	readOnly = false,
	onChange,
}: NumberInputProps) {
	const [draft, setDraft] = useState(String(value))
	const [shownValue, setShownValue] = useState(value)

	// The value changed from outside (import, reset): show it, unless the draft already does
	// (typing "10.50" commits 10.5 and must keep the trailing zero).
	if (value !== shownValue) {
		setShownValue(value)
		if (Number(draft) !== value) setDraft(String(value))
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		setDraft(event.currentTarget.value)
		const number = event.currentTarget.valueAsNumber
		const valid = isValid
			? isValid(number)
			: Number.isFinite(number) && number >= min && number <= max
		if (valid) onChange(number)
	}

	function handleInputBlur() {
		setDraft(String(value))
	}

	return (
		<input
			id={id}
			type="number"
			min={min}
			max={max}
			step={step}
			aria-label={label}
			aria-describedby={describedBy}
			value={draft}
			readOnly={readOnly}
			onChange={handleInputChange}
			onBlur={handleInputBlur}
		/>
	)
}
