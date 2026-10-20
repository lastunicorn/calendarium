import type { ChangeEvent } from 'react'
import { Field } from './Field'
import styles from './TextAreaField.module.css'
import type { Description } from './description'

interface TextAreaFieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	value: string
	placeholder?: string
	/** Visible lines before it scrolls; the user can drag it taller. */
	rows?: number
	/** A warning under the box, e.g. about lines it couldn't read; none when left out. */
	error?: string
	onChange: (value: string) => void
}

/** A multi-line text box, its text kept as typed, with an optional warning under it. */
export function TextAreaField({
	label,
	description,
	value,
	placeholder,
	rows = 4,
	error,
	onChange,
}: TextAreaFieldProps) {
	function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
		onChange(event.currentTarget.value)
	}

	return (
		<Field label={label} description={description}>
			{(control) => (
				<>
					<textarea
						{...control}
						className={styles.textArea}
						value={value}
						placeholder={placeholder}
						rows={rows}
						spellCheck={false}
						onChange={handleTextAreaChange}
					/>
					{error && (
						<p className={styles.error} role="status">
							{error}
						</p>
					)}
				</>
			)}
		</Field>
	)
}
