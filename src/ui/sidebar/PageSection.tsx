import {
	type Margins,
	margins,
	type Orientation,
	ORIENTATIONS,
	PAPER_SIZES,
	type PaperSize,
	type Spine,
	SPINES,
	type PageSetup,
} from '../../core/paper'
import { PageIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { MarginsField } from '../fields/MarginsField'
import { optionsFrom } from '../fields/options'
import { RadioField } from '../fields/RadioField'
import { SelectField } from '../fields/SelectField'
import { type OptionsSectionProps, Section } from './Section'

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

/**
 * The sheet of paper: size, orientation and margins, optionally mirrored around a spine on even
 * pages, and whether the pages make a booklet.
 */
export function PageSection({ options: page, defaults, onUpdate }: OptionsSectionProps<PageSetup>) {
	function handlePaperSizeChange(paperSize: PaperSize) {
		onUpdate({ paperSize })
	}

	function handleOrientationChange(orientation: Orientation) {
		onUpdate({ orientation })
	}

	function handleMarginsChange(margins: Margins) {
		onUpdate({ margins })
	}

	function handleBookletChange(booklet: boolean) {
		onUpdate({ booklet })
	}

	function handleEqualMarginsChange(equalMargins: boolean) {
		const sides = equalMargins ? margins(page.margins.top) : page.margins
		onUpdate({ equalMargins, margins: sides })
	}

	function handleMirrorMarginsChange(mirrorMargins: boolean) {
		onUpdate({ mirrorMargins })
	}

	function handleSpineChange(spine: Spine) {
		onUpdate({ spine })
	}

	function handleReset() {
		onUpdate(defaults)
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
				label="Print as a booklet"
				description={[
					'Prints two pages per side, on both sides of a paper. When all are stacked together and folded in half, they are in the correct order.',
					'A paper twice the desired size is required (A3 for A4 pages). Portrait pages are printed side by side, landscape ones one above the other.',
					'Blank pages at the end complete the last sheet.',
				]}
				checked={page.booklet}
				onChange={handleBookletChange}
			/>
			<CheckboxField
				label="Use equal margins"
				description={[
					'Every side takes the same margin (the top value).',
					'Not available with mirror margins.',
				]}
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
			{/* A booklet's spine is its fold. */}
			{page.mirrorMargins && !page.booklet && (
				<RadioField
					label="Spine"
					description={[
						'Specifies on which edge the pages are bound.',
						'Even pages have their margins swapped according to the spine position.',
					]}
					value={page.spine}
					options={SPINE_OPTIONS}
					onChange={handleSpineChange}
				/>
			)}
		</Section>
	)
}
