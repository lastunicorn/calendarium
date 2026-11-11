import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from '../cells'
import {
	START_PAGES,
	type StartPage,
	WEEK_PAGE_FILLS,
	type WeekPageFill,
	type WeeklyContent,
} from '../options'
import type { Patch } from '../../../core/data'
import type { HourSchedule } from '../../schedule'
import type { WeekdayFormat } from '../../../core/locale'
import { ContentIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { WEEKDAY_FORMAT_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { ScheduleFields } from '../../../ui/sidebar/ScheduleFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const HOURS_DESCRIPTION = [
	'Display a grid with hours for each day.',
	'Hours are not drawn for the days of the previous or next year.',
	'Hours are not drawn for Saturday and Sunday while they share the same cell: there is no room.',
]

const WEEKEND_DISPLAY_OPTIONS = optionsFrom(WEEKEND_DISPLAYS, {
	full: 'Full',
	reduced: 'Reduced (One shared cell)',
	hidden: 'Hidden',
})

const WEEK_DAY_DIRECTION_OPTIONS = optionsFrom(WEEK_DAY_DIRECTIONS, {
	vertical: 'Vertical (columns)',
	horizontal: 'Horizontal (rows)',
})

const START_PAGE_OPTIONS = optionsFrom(START_PAGES, {
	odd: 'Odd page (first page)',
	even: 'Even page (second page)',
})

const START_PAGE_DESCRIPTION =
	'Printed double-sided, a week starting on an even page faces the next page, so each week’s two pages lie open side by side.'

const WEEK_PAGE_FILL_OPTIONS = optionsFrom(WEEK_PAGE_FILLS, {
	none: 'Off',
	hours: 'Hourly schedule',
})

/**
 * How a week's page (or two) is divided between its days, how each day is labeled,
 * and what fills its cell.
 */
export function WeekContentSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeeklyContent>) {
	function handleWeekdayFormatChange(weekdayFormat: WeekdayFormat) {
		onUpdate({ weekdayFormat })
	}

	function handleHighlightWeekendDaysChange(highlightWeekendDays: boolean) {
		onUpdate({ highlightWeekendDays })
	}

	function handleWeekendDisplayChange(weekendDisplay: WeekendDisplay) {
		onUpdate({ weekendDisplay })
	}

	function handleFillChange(fill: WeekPageFill) {
		onUpdate({ fill })
	}

	function handleScheduleUpdate(schedule: Patch<HourSchedule>) {
		onUpdate({ schedule })
	}

	function handleDayDirectionChange(dayDirection: WeekDayDirection) {
		onUpdate({ dayDirection })
	}

	function handleTwoPagesChange(twoPages: boolean) {
		onUpdate({ twoPages })
	}

	function handleStartPageChange(startPage: StartPage) {
		onUpdate({ startPage })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<CheckboxField
				label="Two pages per week"
				description="The first three days go on the first page, under the title; the rest on the second, under the mini calendar if shown."
				checked={options.twoPages}
				onChange={handleTwoPagesChange}
			/>
			<RadioField
				label="Start on"
				description={START_PAGE_DESCRIPTION}
				value={options.startPage}
				options={START_PAGE_OPTIONS}
				onChange={handleStartPageChange}
			/>
			<RadioField
				label="Days direction"
				value={options.dayDirection}
				options={WEEK_DAY_DIRECTION_OPTIONS}
				onChange={handleDayDirectionChange}
			/>
			<RadioField
				label="Weekday names"
				value={options.weekdayFormat}
				options={WEEKDAY_FORMAT_OPTIONS}
				onChange={handleWeekdayFormatChange}
			/>
			<CheckboxField
				label="Highlight weekends"
				checked={options.highlightWeekendDays}
				onChange={handleHighlightWeekendDaysChange}
			/>
			<RadioField
				label="Weekend"
				description={
					options.weekendDisplay === 'hidden'
						? 'A week whose only days in this year are its weekend gets no page.'
						: undefined
				}
				value={options.weekendDisplay}
				options={WEEKEND_DISPLAY_OPTIONS}
				onChange={handleWeekendDisplayChange}
			/>
			<RadioField
				label="Hours"
				description={HOURS_DESCRIPTION}
				value={options.fill}
				options={WEEK_PAGE_FILL_OPTIONS}
				onChange={handleFillChange}
			/>
			{options.fill === 'hours' && (
				<ScheduleFields options={options.schedule} onUpdate={handleScheduleUpdate} />
			)}
		</Section>
	)
}
