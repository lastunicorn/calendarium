import type { CommonConfig } from '../../layouts/common'
import {
	type Margins,
	margins,
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

const SPINE_DESCRIPTION = [
	'The bound edge of the first page.',
	'Even pages swap the left and right margins with a left spine, the top and bottom ones with a top spine.',
]

/** The sheet of paper: size, orientation and margins, optionally mirrored around a spine on even pages. */
export function PageSection({ config, defaults, onUpdate }: ConfigSectionProps<CommonConfig>) {
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

	function handleEqualMarginsChange(equalMargins: boolean) {
		const sides = equalMargins ? margins(page.margins.top) : page.margins
		onUpdate({ page: { ...page, equalMargins, margins: sides } })
	}

	function handleMirrorMarginsChange(mirrorMargins: boolean) {
		onUpdate({ page: { ...page, mirrorMargins } })
	}

	function handleSpineChange(spine: Spine) {
		onUpdate({ page: { ...page, spine } })
	}

	function handleReset() {
		onUpdate({ page: defaults.page })
	}

	return (
		<Section title="Page" icon={<PageIcon />} onReset={handleReset}>
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
			<CheckboxField
				label="Use equal margins"
				description="Every side takes the top margin: editing it sets them all. Not available with mirror margins."
				checked={page.equalMargins}
				disabled={page.mirrorMargins}
				onChange={handleEqualMarginsChange}
			/>
			<MarginsField
				value={page.margins}
				orientation={page.orientation}
				spine={page.mirrorMargins ? page.spine : undefined}
				equal={page.equalMargins}
				onChange={handleMarginsChange}
			/>
			<CheckboxField
				label="Use mirror margins"
				description="For double-sided printing: even pages swap the margins on either side of the spine, so the inner margin stays on the bound edge."
				checked={page.mirrorMargins}
				onChange={handleMirrorMarginsChange}
			/>
			{page.mirrorMargins && (
				<RadioField
					label="Spine"
					description={SPINE_DESCRIPTION}
					value={page.spine}
					options={SPINE_OPTIONS}
					onChange={handleSpineChange}
				/>
			)}
		</Section>
	)
}
