import {
	WEEK_PAGE_LINES,
	type WeekPageLines,
	type WeekPerPageConfig,
} from '../../../config/layouts/weekPerPage'
import { WEEKEND_DISPLAYS, type WeekendDisplay } from '../../../core/weekend'
import { DayPageIcon } from '../../components/icons'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const WEEKEND_DISPLAY_OPTIONS = optionsFrom(WEEKEND_DISPLAYS, {
	full: 'Full',
	reduced: 'Reduced (One shared cell)',
	hidden: 'Hidden',
})

const WEEK_PAGE_LINES_OPTIONS = optionsFrom(WEEK_PAGE_LINES, {
	none: 'Off',
	hours: 'Hourly schedule',
})

/** How a week's page is divided between its days, and what fills each day's cell. */
export function WeekPageSection({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleWeekendDisplayChange(weekendDisplay: WeekendDisplay) {
		onUpdate({ weekendDisplay })
	}

	function handleWeekPageLinesChange(weekPageLines: WeekPageLines) {
		onUpdate({ weekPageLines })
	}

	return (
		<Section title="Week page" icon={<DayPageIcon />}>
			<RadioField
				label="Weekend"
				value={config.weekendDisplay}
				options={WEEKEND_DISPLAY_OPTIONS}
				onChange={handleWeekendDisplayChange}
			/>
			<RadioField
				label="Hours"
				description={
					config.weekPageLines === 'hours' && config.weekendDisplay === 'reduced'
						? 'Not drawn for Saturday and Sunday while they share a cell: there is no room.'
						: undefined
				}
				value={config.weekPageLines}
				options={WEEK_PAGE_LINES_OPTIONS}
				onChange={handleWeekPageLinesChange}
			/>
			{config.weekPageLines === 'hours' && (
				<ScheduleFields config={config} onUpdate={onUpdate} />
			)}
		</Section>
	)
}
