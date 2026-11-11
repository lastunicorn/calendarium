import type { HeadingAlignment } from '../../heading'
import type { WeeklyHeader } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { RadioField } from '../../../ui/fields/RadioField'
import { WEEK_NUMBER_DESCRIPTION } from '../../../ui/sidebar/descriptions'
import { HEADING_ALIGNMENT_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

/** What a week's heading shows besides the dates of its days, and where it sits. */
export function HeaderSection({ options, defaults, onUpdate }: OptionsSectionProps<WeeklyHeader>) {
	function handleShowWeekChange(showWeek: boolean) {
		onUpdate({ showWeek })
	}

	function handleAlignmentChange(alignment: HeadingAlignment) {
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
			<RadioField
				label="Title alignment"
				description={
					options.alignment === 'auto'
						? 'Left beside the mini calendars or over two pages, centered otherwise.'
						: undefined
				}
				value={options.alignment}
				options={HEADING_ALIGNMENT_OPTIONS}
				onChange={handleAlignmentChange}
			/>
			<HeadingFontSizeField value={options.fontSize} onChange={handleFontSizeChange} />
			<CheckboxField
				label="Show week number"
				description={WEEK_NUMBER_DESCRIPTION}
				checked={options.showWeek}
				onChange={handleShowWeekChange}
			/>
		</Section>
	)
}
