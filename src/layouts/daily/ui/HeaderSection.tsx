import { DAY_PAGE_HEADINGS, type DayPageHeading, type DailyHeader } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { DAY_WEEK_NUMBER_DESCRIPTION } from '../../../ui/sidebar/descriptions'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const DAY_PAGE_HEADING_OPTIONS = optionsFrom(DAY_PAGE_HEADINGS, {
	weekday: 'Weekday (date below)',
	date: 'Date (weekday below)',
})

/**
 * What a day's heading shows and whether it takes the weekend color, and what its details, after
 * the subheading, hold.
 */
export function HeaderSection({ options, defaults, onUpdate }: OptionsSectionProps<DailyHeader>) {
	function handleHeadingChange(heading: DayPageHeading) {
		onUpdate({ heading })
	}

	function handleFontSizeChange(fontSize: number) {
		onUpdate({ fontSize })
	}

	function handleShowWeekChange(showWeek: boolean) {
		onUpdate({ showWeek })
	}

	function handleShowDayOfYearChange(showDayOfYear: boolean) {
		onUpdate({ showDayOfYear })
	}

	function handleHighlightWeekendDaysChange(highlightWeekendDays: boolean) {
		onUpdate({ highlightWeekendDays })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
			<RadioField
				label="Title"
				value={options.heading}
				options={DAY_PAGE_HEADING_OPTIONS}
				onChange={handleHeadingChange}
			/>
			<HeadingFontSizeField value={options.fontSize} onChange={handleFontSizeChange} />
			<CheckboxField
				label="Show week number"
				description={DAY_WEEK_NUMBER_DESCRIPTION}
				checked={options.showWeek}
				onChange={handleShowWeekChange}
			/>
			<CheckboxField
				label="Show day of year"
				checked={options.showDayOfYear}
				onChange={handleShowDayOfYearChange}
			/>
			<CheckboxField
				label="Highlight weekends"
				checked={options.highlightWeekendDays}
				onChange={handleHighlightWeekendDaysChange}
			/>
		</Section>
	)
}
