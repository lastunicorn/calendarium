import {
	HEADING_ALIGNMENTS,
	type HeadingAlignment,
	type WeekPerPageConfig,
} from '../../../layouts/week-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const HEADING_ALIGNMENT_OPTIONS = optionsFrom(HEADING_ALIGNMENTS, {
	auto: 'Automatic',
	left: 'Left',
	center: 'Center',
	right: 'Right',
})

/** What a week's heading shows besides the dates of its days, and where it sits. */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	function handleHeadingAlignmentChange(headingAlignment: HeadingAlignment) {
		onUpdate({ headingAlignment })
	}

	return (
		<Section title="Header" icon={<HeaderIcon />}>
			<CheckboxField
				label="Show week number"
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
			<RadioField
				label="Title alignment"
				description={
					config.headingAlignment === 'auto'
						? 'Left beside the mini calendar or over two pages, centered otherwise.'
						: undefined
				}
				value={config.headingAlignment}
				options={HEADING_ALIGNMENT_OPTIONS}
				onChange={handleHeadingAlignmentChange}
			/>
		</Section>
	)
}
