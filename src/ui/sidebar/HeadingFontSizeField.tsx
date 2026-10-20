import { MAX_HEADING_FONT_SIZE, MIN_HEADING_FONT_SIZE } from '../../layouts/heading'
import { NumberField } from '../fields/NumberField'

interface HeadingFontSizeFieldProps {
	value: number
	onChange: (headingFontSize: number) => void
}

/** The heading's font size, for the layouts with a `headingFontSize`. */
export function HeadingFontSizeField({ value, onChange }: HeadingFontSizeFieldProps) {
	return (
		<NumberField
			label="Title size (pt)"
			description={`From ${MIN_HEADING_FONT_SIZE} to ${MAX_HEADING_FONT_SIZE} pt.`}
			value={value}
			min={MIN_HEADING_FONT_SIZE}
			max={MAX_HEADING_FONT_SIZE}
			onChange={onChange}
		/>
	)
}
