import type { HeadingAlignment } from '../../../layouts/heading'
import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { RadioField } from '../../fields/RadioField'
import { WEEK_NUMBER_DESCRIPTION } from '../../sidebar/descriptions'
import { HEADING_ALIGNMENT_OPTIONS } from '../../sidebar/fieldOptions'
import { defaultFields } from '../../sidebar/defaultFields'
import { HeadingFontSizeField } from '../../sidebar/HeadingFontSizeField'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

/** What a week's heading shows besides the dates of its days, and where it sits. */
export function HeaderSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<WeekPerPageConfig>) {
	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	function handleHeadingAlignmentChange(headingAlignment: HeadingAlignment) {
		onUpdate({ headingAlignment })
	}

	function handleHeadingFontSizeChange(headingFontSize: number) {
		onUpdate({ headingFontSize })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['headingAlignment', 'headingFontSize', 'showHeaderWeek']))
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
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
			<HeadingFontSizeField
				value={config.headingFontSize}
				onChange={handleHeadingFontSizeChange}
			/>
			<CheckboxField
				label="Show week number"
				description={WEEK_NUMBER_DESCRIPTION}
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
		</Section>
	)
}
