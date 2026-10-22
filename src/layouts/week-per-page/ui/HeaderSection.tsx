import type { HeadingAlignment } from '../../heading'
import type { WeekPerPageConfig } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { RadioField } from '../../../ui/fields/RadioField'
import { WEEK_NUMBER_DESCRIPTION } from '../../../ui/sidebar/descriptions'
import { HEADING_ALIGNMENT_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { type ConfigSectionProps, Section } from '../../../ui/sidebar/Section'

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
