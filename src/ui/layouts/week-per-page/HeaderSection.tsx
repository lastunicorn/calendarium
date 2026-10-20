import type { HeadingAlignment } from '../../../layouts/heading'
import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { RadioField } from '../../fields/RadioField'
import { HEADING_ALIGNMENT_OPTIONS } from '../../sidebar/fieldOptions'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

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
			<RadioField
				label="Title alignment"
				description={
					config.headingAlignment === 'auto'
						? 'Aligned left beside the mini calendar or over two pages, centered otherwise.'
						: undefined
				}
				value={config.headingAlignment}
				options={HEADING_ALIGNMENT_OPTIONS}
				onChange={handleHeadingAlignmentChange}
			/>
			<CheckboxField
				label="Show week number"
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
		</Section>
	)
}
