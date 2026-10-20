import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from '../../../layouts/week-per-page/cells'
import {
	isFooterHeight,
	MAX_FOOTER_HEIGHT,
	MIN_FOOTER_HEIGHT,
	START_PAGES,
	type StartPage,
	WEEK_PAGE_LINES,
	type WeekPageLines,
	type WeekPerPageConfig,
} from '../../../layouts/week-per-page/options'
import type { WeekdayFormat } from '../../../core/locale'
import { ContentIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { NumberField } from '../../fields/NumberField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { defaultFields } from '../../sidebar/defaultFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const HOURS_DESCRIPTION = 'Not drawn for the grayed days of the previous or next year.'

const HOURS_SHARED_WEEKEND_DESCRIPTION = [
	HOURS_DESCRIPTION,
	'Nor for Saturday and Sunday while they share a cell: there is no room.',
]

const WEEKEND_DISPLAY_OPTIONS = optionsFrom(WEEKEND_DISPLAYS, {
	full: 'Full',
	reduced: 'Reduced (One shared cell)',
	hidden: 'Hidden',
})

const WEEK_DAY_DIRECTION_OPTIONS = optionsFrom(WEEK_DAY_DIRECTIONS, {
	auto: 'Automatic (by orientation)',
	vertical: 'Vertical (columns)',
	horizontal: 'Horizontal (rows)',
})

const START_PAGE_OPTIONS = optionsFrom(START_PAGES, {
	odd: 'Odd page',
	even: 'Even page (a blank page first)',
})

const START_PAGE_DESCRIPTION =
	'Printed double-sided, a week starting on an even page faces the next page, so each week’s two pages lie open side by side.'

const FOOTER_DESCRIPTION = 'An empty space under the days, on every page.'

const WEEK_PAGE_LINES_OPTIONS = optionsFrom(WEEK_PAGE_LINES, {
	none: 'Off',
	hours: 'Hourly schedule',
})

/**
 * How a week's page (or two) is divided between its days, how each day is labeled,
 * and what fills its cell.
 */
export function WeekContentSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<WeekPerPageConfig>) {
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

	function handleStartPageChange(startPage: StartPage) {
		onUpdate({ startPage })
	}

	function handleShowFooterChange(showFooter: boolean) {
		onUpdate({ showFooter })
	}

	function handleFooterHeightChange(footerHeight: number) {
		onUpdate({ footerHeight })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'twoPagesPerWeek',
				'startPage',
				'weekDayDirection',
				'weekdayFormat',
				'highlightWeekendDays',
				'weekendDisplay',
				'weekPageLines',
				'hourFormat',
				'firstHour',
				'lastHour',
				'showFooter',
				'footerHeight',
			]),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<CheckboxField
				label="Two pages per week"
				description="The first three days go on the first page, under the title; the rest on the second, under the mini calendar if shown."
				checked={config.twoPagesPerWeek}
				onChange={handleTwoPagesPerWeekChange}
			/>
			<RadioField
				label="Start on"
				description={START_PAGE_DESCRIPTION}
				value={config.startPage}
				options={START_PAGE_OPTIONS}
				onChange={handleStartPageChange}
			/>
			<RadioField
				label="Days direction"
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
			<RadioField
				label="Weekend"
				description={
					config.weekendDisplay === 'hidden'
						? 'A week whose only days in this year are its weekend gets no page.'
						: undefined
				}
				value={config.weekendDisplay}
				options={WEEKEND_DISPLAY_OPTIONS}
				onChange={handleWeekendDisplayChange}
			/>
			<RadioField
				label="Hours"
				description={
					config.weekPageLines !== 'hours'
						? undefined
						: config.weekendDisplay === 'reduced'
							? HOURS_SHARED_WEEKEND_DESCRIPTION
							: HOURS_DESCRIPTION
				}
				value={config.weekPageLines}
				options={WEEK_PAGE_LINES_OPTIONS}
				onChange={handleWeekPageLinesChange}
			/>
			{config.weekPageLines === 'hours' && (
				<ScheduleFields config={config} onUpdate={onUpdate} />
			)}
			<CheckboxField
				label="Footer"
				description={FOOTER_DESCRIPTION}
				checked={config.showFooter}
				onChange={handleShowFooterChange}
			/>
			{config.showFooter && (
				<NumberField
					label="Footer height (mm)"
					description={`Whole mm, from ${MIN_FOOTER_HEIGHT} to ${MAX_FOOTER_HEIGHT}.`}
					value={config.footerHeight}
					min={MIN_FOOTER_HEIGHT}
					max={MAX_FOOTER_HEIGHT}
					step={1}
					isValid={isFooterHeight}
					onChange={handleFooterHeightChange}
				/>
			)}
		</Section>
	)
}
