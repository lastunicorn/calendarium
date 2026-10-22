import { DAY_PAGE_TITLES, type DayPageTitle, type DayPerPageOptions } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { DAY_WEEK_NUMBER_DESCRIPTION } from '../../../ui/sidebar/descriptions'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const DAY_PAGE_TITLE_OPTIONS = optionsFrom(DAY_PAGE_TITLES, {
	weekday: 'Weekday (date below)',
	date: 'Date (weekday below)',
})

/**
 * What a day's heading shows and whether it takes the weekend color, and what its details, after
 * the subheading, hold.
 */
export function HeaderSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<DayPerPageOptions>) {
	function handleDayPageTitleChange(dayPageTitle: DayPageTitle) {
		onUpdate({ dayPageTitle })
	}

	function handleHeadingFontSizeChange(headingFontSize: number) {
		onUpdate({ headingFontSize })
	}

	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	function handleShowHeaderDayOfYearChange(showHeaderDayOfYear: boolean) {
		onUpdate({ showHeaderDayOfYear })
	}

	function handleHighlightWeekendDaysChange(highlightWeekendDays: boolean) {
		onUpdate({ highlightWeekendDays })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'dayPageTitle',
				'headingFontSize',
				'showHeaderWeek',
				'showHeaderDayOfYear',
				'highlightWeekendDays',
			]),
		)
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
			<RadioField
				label="Title"
				value={options.dayPageTitle}
				options={DAY_PAGE_TITLE_OPTIONS}
				onChange={handleDayPageTitleChange}
			/>
			<HeadingFontSizeField
				value={options.headingFontSize}
				onChange={handleHeadingFontSizeChange}
			/>
			<CheckboxField
				label="Show week number"
				description={DAY_WEEK_NUMBER_DESCRIPTION}
				checked={options.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
			<CheckboxField
				label="Show day of year"
				checked={options.showHeaderDayOfYear}
				onChange={handleShowHeaderDayOfYearChange}
			/>
			<CheckboxField
				label="Highlight weekends"
				checked={options.highlightWeekendDays}
				onChange={handleHighlightWeekendDaysChange}
			/>
		</Section>
	)
}
