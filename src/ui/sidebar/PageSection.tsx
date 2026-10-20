import type { CommonConfig } from '../../layouts/common'
import {
	type Margins,
	type Orientation,
	ORIENTATIONS,
	PAPER_SIZES,
	type PaperSize,
	type Spine,
	SPINES,
} from '../../core/paper'
import { PageIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { MarginsField } from '../fields/MarginsField'
import { optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const PAPER_SIZE_OPTIONS = optionsFrom(PAPER_SIZES, {
	a3: 'A3',
	a4: 'A4',
	a5: 'A5',
	letter: 'Letter',
})

const ORIENTATION_OPTIONS = optionsFrom(ORIENTATIONS, {
	portrait: 'Portrait',
	landscape: 'Landscape',
})

const SPINE_OPTIONS = optionsFrom(SPINES, {
	left: 'Left (book)',
	top: 'Top (flip calendar)',
})

/** The sheet of paper: size, orientation and margins, optionally mirrored around a spine on even pages. */
export function PageSection({ config, onUpdate }: ConfigSectionProps<CommonConfig>) {
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

	function handleMirrorMarginsChange(mirrorMargins: boolean) {
		onUpdate({ page: { ...page, mirrorMargins } })
	}

	function handleSpineChange(spine: Spine) {
		onUpdate({ page: { ...page, spine } })
	}

	return (
		<Section title="Page" icon={<PageIcon />}>
			<SelectField
				label="Paper size"
				value={page.paperSize}
				options={PAPER_SIZE_OPTIONS}
				onChange={handlePaperSizeChange}
			/>
			<RadioField
				label="Orientation"
				value={page.orientation}
				options={ORIENTATION_OPTIONS}
				onChange={handleOrientationChange}
			/>
			<MarginsField
				value={page.margins}
				orientation={page.orientation}
				spine={page.mirrorMargins ? page.spine : undefined}
				onChange={handleMarginsChange}
			/>
			<CheckboxField
				label="Use mirror margins"
				checked={page.mirrorMargins}
				onChange={handleMirrorMarginsChange}
			/>
			{page.mirrorMargins && (
				<RadioField
					label="Spine"
					description="The bound edge of the first page; even pages swap the margins on either side of it."
					value={page.spine}
					options={SPINE_OPTIONS}
					onChange={handleSpineChange}
				/>
			)}
		</Section>
	)
}
