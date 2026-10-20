import { type ChangeEvent, useRef } from 'react'
import { Field } from './Field'
import styles from './TextField.module.css'
import type { Description } from './description'

interface TextFieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	value: string
	placeholder?: string
	onChange: (value: string) => void
}

/** A text input with a clear button at its right end, shown while it holds text. */
export function TextField({ label, description, value, placeholder, onChange }: TextFieldProps) {
	const input = useRef<HTMLInputElement>(null)

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.currentTarget.value)
	}

	function handleClearClick() {
		onChange('')
		input.current?.focus()
	}

	return (
		<Field label={label} description={description}>
			{(control) => (
				<div className={styles.box}>
					<input
						{...control}
						ref={input}
						className={styles.input}
						type="text"
						value={value}
						placeholder={placeholder}
						onChange={handleInputChange}
					/>
					{value !== '' && (
						<button
							type="button"
							className={styles.clear}
							aria-label={`Clear ${label}`}
							title="Clear"
							onClick={handleClearClick}
						>
							<svg viewBox="0 0 16 16" aria-hidden="true">
								<path d="M4 4l8 8M12 4l-8 8" />
							</svg>
						</button>
					)}
				</div>
			)}
		</Field>
	)
}
