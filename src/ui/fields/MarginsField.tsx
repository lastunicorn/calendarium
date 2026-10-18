import {
	isMargin,
	MARGIN_SIDES,
	type MarginSide,
	type Margins,
	MAX_MARGIN,
} from '../../config/CalendarConfig'
import styles from './MarginsField.module.css'
import { NumberInput } from './NumberInput'

const MARGIN_LABELS: Record<MarginSide, string> = {
	top: 'Top',
	right: 'Right',
	bottom: 'Bottom',
	left: 'Left',
}

interface MarginInputProps {
	side: MarginSide
	value: number
	onChange: (side: MarginSide, margin: number) => void
}

function MarginInput({ side, value, onChange }: MarginInputProps) {
	function handleInputChange(margin: number) {
		onChange(side, margin)
	}

	return (
		<label className={styles.margin}>
			{MARGIN_LABELS[side]}
			<NumberInput
				value={value}
				min={0}
				max={MAX_MARGIN}
				step={0.5}
				isValid={isMargin}
				onChange={handleInputChange}
			/>
		</label>
	)
}

interface MarginsFieldProps {
	value: Margins
	onChange: (margins: Margins) => void
}

/** The four page margins in mm, as a 2×2 grid. */
export function MarginsField({ value, onChange }: MarginsFieldProps) {
	function handleMarginChange(side: MarginSide, margin: number) {
		onChange({ ...value, [side]: margin })
	}

	return (
		<fieldset className={styles.margins}>
			<legend>Margins (mm)</legend>
			{MARGIN_SIDES.map((side) => (
				<MarginInput
					key={side}
					side={side}
					value={value[side]}
					onChange={handleMarginChange}
				/>
			))}
		</fieldset>
	)
}
