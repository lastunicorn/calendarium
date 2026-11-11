import type { HeadingAlign } from '../../heading'
import type { MonthlyOptions } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { RadioField } from '../../../ui/fields/RadioField'
import { TextField } from '../../../ui/fields/TextField'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { HEADING_ALIGN_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const TITLE_DESCRIPTION = [
	'Printed at the top of every page, with the month and year below it.',
	'When empty, the month and year are the title.',
]

/** The title above every month, and where and how large the heading sits above its grid. */
export function HeaderSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<MonthlyOptions>) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleMonthHeadingAlignmentChange(monthHeadingAlignment: HeadingAlign) {
		onUpdate({ monthHeadingAlignment })
	}

	function handleHeadingFontSizeChange(headingFontSize: number) {
		onUpdate({ headingFontSize })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['title', 'monthHeadingAlignment', 'headingFontSize']))
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
				value={options.monthHeadingAlignment}
				options={HEADING_ALIGN_OPTIONS}
				onChange={handleMonthHeadingAlignmentChange}
			/>
			<HeadingFontSizeField
				value={options.headingFontSize}
				onChange={handleHeadingFontSizeChange}
			/>
		</Section>
	)
}
