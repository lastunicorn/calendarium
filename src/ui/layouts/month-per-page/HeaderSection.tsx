import type { HeadingAlign } from '../../../layouts/heading'
import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { RadioField } from '../../fields/RadioField'
import { TextField } from '../../fields/TextField'
import { HEADING_ALIGN_OPTIONS } from '../../sidebar/fieldOptions'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const TITLE_DESCRIPTION =
	'Printed at the top of every page, with the month and year below it. When empty, the month and year are the title.'

/** The title above every month, and where the heading sits above its grid. */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps<MonthPerPageConfig>) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleMonthHeadingAlignmentChange(monthHeadingAlignment: HeadingAlign) {
		onUpdate({ monthHeadingAlignment })
	}

	return (
		<Section title="Header" icon={<HeaderIcon />}>
			<TextField
				label="Title"
				description={TITLE_DESCRIPTION}
				value={config.title}
				onChange={handleTitleChange}
			/>
			<RadioField
				label="Title alignment"
				value={config.monthHeadingAlignment}
				options={HEADING_ALIGN_OPTIONS}
				onChange={handleMonthHeadingAlignmentChange}
			/>
		</Section>
	)
}
