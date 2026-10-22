import {
	WEEK_DAY_DIRECTIONS,
	type WeekDayDirection,
	WEEKEND_DISPLAYS,
	type WeekendDisplay,
} from '../cells'
import {
	isFooterHeight,
	MAX_FOOTER_HEIGHT,
	MIN_FOOTER_HEIGHT,
	START_PAGES,
	type StartPage,
	WEEK_PAGE_LINES,
	type WeekPageLines,
	type WeekPerPageOptions,
} from '../options'
import type { WeekdayFormat } from '../../../core/locale'
import { ContentIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { NumberField } from '../../../ui/fields/NumberField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { WEEKDAY_FORMAT_OPTIONS } from '../../../ui/sidebar/fieldOptions'
import { ScheduleFields } from '../../../ui/sidebar/ScheduleFields'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

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
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<WeekPerPageOptions>) {
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
				checked={options.twoPagesPerWeek}
				onChange={handleTwoPagesPerWeekChange}
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
				description={
					options.weekDayDirection === 'auto'
						? 'Columns on landscape paper or over two pages, rows on portrait.'
						: undefined
				}
				value={options.weekDayDirection}
				options={WEEK_DAY_DIRECTION_OPTIONS}
				onChange={handleWeekDayDirectionChange}
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
				description={
					options.weekPageLines !== 'hours'
						? undefined
						: options.weekendDisplay === 'reduced'
							? HOURS_SHARED_WEEKEND_DESCRIPTION
							: HOURS_DESCRIPTION
				}
				value={options.weekPageLines}
				options={WEEK_PAGE_LINES_OPTIONS}
				onChange={handleWeekPageLinesChange}
			/>
			{options.weekPageLines === 'hours' && (
				<ScheduleFields options={options} onUpdate={onUpdate} />
			)}
			<CheckboxField
				label="Footer"
				description={FOOTER_DESCRIPTION}
				checked={options.showFooter}
				onChange={handleShowFooterChange}
			/>
			{options.showFooter && (
				<NumberField
					label="Footer height (mm)"
					description={`Whole mm, from ${MIN_FOOTER_HEIGHT} to ${MAX_FOOTER_HEIGHT}.`}
					value={options.footerHeight}
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
