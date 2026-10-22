import {
	isMargin,
	margins,
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
	readOnly: boolean
	onChange: (side: MarginSide, margin: number) => void
}

function MarginInput({ side, value, readOnly, onChange }: MarginInputProps) {
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
				readOnly={readOnly}
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
	/** Every side follows the top margin, the other inputs being read-only. */
	equal: boolean
	onChange: (margins: Margins) => void
}

/**
 * The four page margins in mm, each input placed by its side of a drawn page; with `equal`, only
 * the top one is edited, setting them all.
 */
export function MarginsField({ value, orientation, spine, equal, onChange }: MarginsFieldProps) {
	function handleMarginChange(side: MarginSide, margin: number) {
		onChange(equal ? margins(margin) : { ...value, [side]: margin })
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
						readOnly={equal && side !== 'top'}
						onChange={handleMarginChange}
					/>
				))}
			</div>
		</fieldset>
	)
}
