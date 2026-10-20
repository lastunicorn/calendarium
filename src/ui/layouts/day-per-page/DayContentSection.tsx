import {
	DAY_PAGE_LINES,
	type DayPageLines,
	type DayPerPageConfig,
} from '../../../layouts/day-per-page/options'
import { ContentIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
})

/** What fills a day's page: an hourly schedule and its hours, or ruled lines, on one page or two. */
export function DayContentSection({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	function handleTwoPagesPerDayChange(twoPagesPerDay: boolean) {
		onUpdate({ twoPagesPerDay })
	}

	return (
		<Section title="Content" icon={<ContentIcon />}>
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
