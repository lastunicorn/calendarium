import type { HeadingAlign } from '../../../layouts/heading'
import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { RadioField } from '../../fields/RadioField'
import { HEADING_ALIGN_OPTIONS } from '../../sidebar/fieldOptions'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

/** Where a month's heading sits above its grid. */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps<MonthPerPageConfig>) {
	function handleMonthHeadingAlignmentChange(monthHeadingAlignment: HeadingAlign) {
		onUpdate({ monthHeadingAlignment })
	}

	return (
		<Section title="Header" icon={<HeaderIcon />}>
			<RadioField
				label="Title alignment"
				value={config.monthHeadingAlignment}
				options={HEADING_ALIGN_OPTIONS}
				onChange={handleMonthHeadingAlignmentChange}
			/>
		</Section>
	)
}
