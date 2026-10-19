import {
	DAY_PAGE_LINES,
	DAY_PAGE_TITLES,
	type DayPageLines,
	type DayPageTitle,
	type DayPerPageConfig,
} from '../../../config/layouts/dayPerPage'
import { DayPageIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const DAY_PAGE_TITLE_OPTIONS = optionsFrom(DAY_PAGE_TITLES, {
	weekday: 'Weekday (date below)',
	date: 'Date (weekday below)',
})

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
})

/** What fills a day's page: an hourly schedule and its hours, or ruled lines, on one page or two. */
export function DayPageSection({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
	function handleDayPageTitleChange(dayPageTitle: DayPageTitle) {
		onUpdate({ dayPageTitle })
	}

	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	function handleTwoPagesPerDayChange(twoPagesPerDay: boolean) {
		onUpdate({ twoPagesPerDay })
	}

	function handleShowMiniMonthChange(showMiniMonth: boolean) {
		onUpdate({ showMiniMonth })
	}

	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	function handleShowHeaderDayOfYearChange(showHeaderDayOfYear: boolean) {
		onUpdate({ showHeaderDayOfYear })
	}

	return (
		<Section title="Day page" icon={<DayPageIcon />}>
			<CheckboxField
				label="Show mini calendar"
				checked={config.showMiniMonth}
				onChange={handleShowMiniMonthChange}
			/>
			<CheckboxField
				label="Week number in header"
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
			<CheckboxField
				label="Day of year in header"
				checked={config.showHeaderDayOfYear}
				onChange={handleShowHeaderDayOfYearChange}
			/>
			<RadioField
				label="Title"
				value={config.dayPageTitle}
				options={DAY_PAGE_TITLE_OPTIONS}
				onChange={handleDayPageTitleChange}
			/>
			<RadioField
				label="Fill"
				value={config.dayPageLines}
				options={DAY_PAGE_LINES_OPTIONS}
				onChange={handleDayPageLinesChange}
			/>
			<CheckboxField
				label="Two pages per day"
				checked={config.twoPagesPerDay}
				onChange={handleTwoPagesPerDayChange}
			/>
			{config.dayPageLines === 'hours' && (
				<ScheduleFields config={config} onUpdate={onUpdate} />
			)}
		</Section>
	)
}
