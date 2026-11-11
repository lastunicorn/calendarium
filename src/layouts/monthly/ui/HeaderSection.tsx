import type { HeadingAlign } from '../../heading'
import type { MonthlyHeader } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { RadioField } from '../../../ui/fields/RadioField'
import { TextField } from '../../../ui/fields/TextField'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { HEADING_ALIGN_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const TITLE_DESCRIPTION = [
	'Printed at the top of every page, with the month and year below it.',
	'When empty, the month and year are the title.',
]

/** The title above every month, and where and how large the heading sits above its grid. */
export function HeaderSection({ options, defaults, onUpdate }: OptionsSectionProps<MonthlyHeader>) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleAlignmentChange(alignment: HeadingAlign) {
		onUpdate({ alignment })
	}

	function handleFontSizeChange(fontSize: number) {
		onUpdate({ fontSize })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
			<TextField
				label="Title"
				description={TITLE_DESCRIPTION}
				value={options.title}
				onChange={handleTitleChange}
			/>
			<RadioField
				label="Title alignment"
				value={options.alignment}
				options={HEADING_ALIGN_OPTIONS}
				onChange={handleAlignmentChange}
			/>
			<HeadingFontSizeField value={options.fontSize} onChange={handleFontSizeChange} />
		</Section>
	)
}
