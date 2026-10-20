import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from '../../../layouts/week-per-page/cells'
import {
	WEEK_PAGE_LINES,
	type WeekPageLines,
	type WeekPerPageConfig,
} from '../../../layouts/week-per-page/options'
import type { WeekdayFormat } from '../../../core/locale'
import { DayPageIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const WEEKEND_DISPLAY_OPTIONS = optionsFrom(WEEKEND_DISPLAYS, {
	full: 'Full',
	reduced: 'Reduced (One shared cell)',
	hidden: 'Hidden',
})

const WEEK_DAY_DIRECTION_OPTIONS = optionsFrom(WEEK_DAY_DIRECTIONS, {
	auto: 'Automatic (by orientation)',
	vertical: 'Vertical (columns, left to right)',
	horizontal: 'Horizontal (rows, top to bottom)',
})

const WEEK_PAGE_LINES_OPTIONS = optionsFrom(WEEK_PAGE_LINES, {
	none: 'Off',
	hours: 'Hourly schedule',
})

/**
 * How a week's page (or two) is headed and divided between its days, how each day is labeled,
 * and what fills its cell.
 */
export function WeekPageSection({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	function handleWeekdayFormatChange(weekdayFormat: WeekdayFormat) {
		onUpdate({ weekdayFormat })
	}

	function handleHighlightWeekendDaysChange(highlightWeekendDays: boolean) {
		onUpdate({ highlightWeekendDays })
	}

	function handleWeekendDisplayChange(weekendDisplay: WeekendDisplay) {
		onUpdate({ weekendDisplay })
	}

	function handleWeekPageLinesChange(weekPageLines: WeekPageLines) {
		onUpdate({ weekPageLines })
	}

	function handleWeekDayDirectionChange(weekDayDirection: WeekDayDirection) {
		onUpdate({ weekDayDirection })
	}

	function handleTwoPagesPerWeekChange(twoPagesPerWeek: boolean) {
		onUpdate({ twoPagesPerWeek })
	}

	return (
		<Section title="Week page" icon={<DayPageIcon />}>
			<CheckboxField
				label="Week number in header"
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
			<RadioField
				label="Weekday names"
				value={config.weekdayFormat}
				options={WEEKDAY_FORMAT_OPTIONS}
				onChange={handleWeekdayFormatChange}
			/>
			<CheckboxField
				label="Highlight weekends"
				checked={config.highlightWeekendDays}
				onChange={handleHighlightWeekendDaysChange}
			/>
			<CheckboxField
				label="Two pages per week"
				checked={config.twoPagesPerWeek}
				onChange={handleTwoPagesPerWeekChange}
			/>
			<RadioField
				label="Days"
				description={
					config.weekDayDirection === 'auto'
						? 'Columns on landscape paper or over two pages, rows on portrait.'
						: undefined
				}
				value={config.weekDayDirection}
				options={WEEK_DAY_DIRECTION_OPTIONS}
				onChange={handleWeekDayDirectionChange}
			/>
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
