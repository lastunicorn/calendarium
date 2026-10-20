import {
	DAY_PAGE_TITLES,
	type DayPageTitle,
	type DayPerPageConfig,
} from '../../../layouts/day-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { DAY_WEEK_NUMBER_DESCRIPTION } from '../../sidebar/descriptions'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const DAY_PAGE_TITLE_OPTIONS = optionsFrom(DAY_PAGE_TITLES, {
	weekday: 'Weekday (date below)',
	date: 'Date (weekday below)',
})

/**
 * What a day's heading shows and whether it takes the weekend color, and what its details, after
 * the subheading, hold.
 */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
	function handleDayPageTitleChange(dayPageTitle: DayPageTitle) {
		onUpdate({ dayPageTitle })
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

	return (
		<Section title="Header" icon={<HeaderIcon />}>
			<RadioField
				label="Title"
				value={config.dayPageTitle}
				options={DAY_PAGE_TITLE_OPTIONS}
				onChange={handleDayPageTitleChange}
			/>
			<CheckboxField
				label="Show week number"
				description={DAY_WEEK_NUMBER_DESCRIPTION}
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
			<CheckboxField
				label="Show day of year"
				checked={config.showHeaderDayOfYear}
				onChange={handleShowHeaderDayOfYearChange}
			/>
			<CheckboxField
				label="Highlight weekends"
				checked={config.highlightWeekendDays}
				onChange={handleHighlightWeekendDaysChange}
			/>
		</Section>
	)
}
