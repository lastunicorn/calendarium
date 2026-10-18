import type { Margins, Orientation, PaperSize } from '../../config/CalendarConfig'
import { MarginsField } from '../fields/MarginsField'
import { type Option, SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const PAPER_SIZE_OPTIONS: Option<PaperSize>[] = [
	{ value: 'a4', label: 'A4' },
	{ value: 'a3', label: 'A3' },
	{ value: 'letter', label: 'Letter' },
]

const ORIENTATION_OPTIONS: Option<Orientation>[] = [
	{ value: 'portrait', label: 'Portrait' },
	{ value: 'landscape', label: 'Landscape' },
]

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
