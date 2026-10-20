import {
	isMargin,
	MARGIN_SIDES,
	type Margins,
	type MarginSide,
	MAX_MARGIN,
	type Orientation,
	type Spine,
} from '../../core/paper'
import styles from './MarginsField.module.css'
import { NumberInput } from './NumberInput'

const MARGIN_LABELS: Record<MarginSide, string> = {
	top: 'Top margin',
	right: 'Right margin',
	bottom: 'Bottom margin',
	left: 'Left margin',
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
		<div className={`${styles.margin} ${styles[side]}`}>
			<NumberInput
				value={value}
				min={0}
				max={MAX_MARGIN}
				step={0.5}
				label={MARGIN_LABELS[side]}
				isValid={isMargin}
				onChange={handleInputChange}
			/>
		</div>
	)
}

interface MarginsFieldProps {
	value: Margins
	/** The shape of the page drawn between the inputs. */
	orientation: Orientation
	/** The bound edge, drawn on the page when the margins are mirrored. */
	spine?: Spine
	onChange: (margins: Margins) => void
}

/** The four page margins in mm, each input placed by its side of a drawn page. */
export function MarginsField({ value, orientation, spine, onChange }: MarginsFieldProps) {
	function handleMarginChange(side: MarginSide, margin: number) {
		onChange({ ...value, [side]: margin })
	}

	const pageClassName = `${styles.page} ${styles[orientation]}`

	return (
		<fieldset className={styles.margins}>
			<legend>Margins (mm)</legend>
			<div className={styles.layout}>
				<div
					className={
						spine ? `${pageClassName} ${styles[`${spine}Spine`]}` : pageClassName
					}
					aria-hidden="true"
				>
					<div className={styles.contentBox} />
				</div>
				{MARGIN_SIDES.map((side) => (
					<MarginInput
						key={side}
						side={side}
						value={value[side]}
						onChange={handleMarginChange}
					/>
				))}
			</div>
		</fieldset>
	)
}
