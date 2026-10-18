import {
	type Margins,
	type Orientation,
	ORIENTATIONS,
	PAPER_SIZES,
	type PaperSize,
} from '../../config/CalendarConfig'
import { MarginsField } from '../fields/MarginsField'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const PAPER_SIZE_OPTIONS = optionsFrom(PAPER_SIZES, { a4: 'A4', a3: 'A3', letter: 'Letter' })

const ORIENTATION_OPTIONS = optionsFrom(ORIENTATIONS, {
	portrait: 'Portrait',
	landscape: 'Landscape',
})

/** The sheet of paper: size, orientation and margins. */
export function PageSection({ config, onUpdate }: ConfigSectionProps) {
	function handlePaperSizeChange(paperSize: PaperSize) {
		onUpdate({ paperSize })
	}

	function handleOrientationChange(orientation: Orientation) {
		onUpdate({ orientation })
	}

	function handleMarginsChange(margins: Margins) {
		onUpdate({ margins })
	}

	return (
		<Section title="Page">
			<SelectField
				label="Paper size"
				value={config.paperSize}
				options={PAPER_SIZE_OPTIONS}
				onChange={handlePaperSizeChange}
			/>
			<SelectField
				label="Orientation"
				value={config.orientation}
				options={ORIENTATION_OPTIONS}
				onChange={handleOrientationChange}
			/>
			<MarginsField value={config.margins} onChange={handleMarginsChange} />
		</Section>
	)
}
