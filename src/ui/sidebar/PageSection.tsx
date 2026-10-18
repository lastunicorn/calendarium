import type { Margins } from '../../config/CalendarConfig'
import { type Orientation, ORIENTATIONS, PAPER_SIZES, type PaperSize } from '../../core/paper'
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
	const { page } = config

	function handlePaperSizeChange(paperSize: PaperSize) {
		onUpdate({ page: { ...page, paperSize } })
	}

	function handleOrientationChange(orientation: Orientation) {
		onUpdate({ page: { ...page, orientation } })
	}

	function handleMarginsChange(margins: Margins) {
		onUpdate({ page: { ...page, margins } })
	}

	return (
		<Section title="Page">
			<SelectField
				label="Paper size"
				value={page.paperSize}
				options={PAPER_SIZE_OPTIONS}
				onChange={handlePaperSizeChange}
			/>
			<SelectField
				label="Orientation"
				value={page.orientation}
				options={ORIENTATION_OPTIONS}
				onChange={handleOrientationChange}
			/>
			<MarginsField value={page.margins} onChange={handleMarginsChange} />
		</Section>
	)
}
