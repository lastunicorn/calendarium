import {
	DAY_PAGE_LINES,
	type DayPageLines,
	type DayPerPageConfig,
	MAX_RULED_LINE_SPACING,
	MAX_SQUARE_SIZE,
	MIN_RULED_LINE_SPACING,
	MIN_SQUARE_SIZE,
} from '../../../layouts/day-per-page/options'
import { ContentIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { NumberField } from '../../fields/NumberField'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { ScheduleFields } from '../../sidebar/ScheduleFields'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
	squares: 'Squares',
})

/**
 * What fills a day's page: an hourly schedule and its hours, ruled lines and their spacing, or
 * squares and their size, on one page or two.
 */
export function DayContentSection({ config, onUpdate }: ConfigSectionProps<DayPerPageConfig>) {
	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	function handleRuledLineSpacingChange(ruledLineSpacing: number) {
		onUpdate({ ruledLineSpacing })
	}

	function handleSquareSizeChange(squareSize: number) {
		onUpdate({ squareSize })
	}

	function handleTwoPagesPerDayChange(twoPagesPerDay: boolean) {
		onUpdate({ twoPagesPerDay })
	}

	return (
		<Section title="Content" icon={<ContentIcon />}>
			<CheckboxField
				label="Two pages per day"
				description="The header goes on the first page only; an hourly schedule is split in half across the two."
				checked={config.twoPagesPerDay}
				onChange={handleTwoPagesPerDayChange}
			/>
			<RadioField
				label="Fill"
				value={config.dayPageLines}
				options={DAY_PAGE_LINES_OPTIONS}
				onChange={handleDayPageLinesChange}
			/>
			{config.dayPageLines === 'hours' && (
				<ScheduleFields config={config} onUpdate={onUpdate} />
			)}
			{config.dayPageLines === 'ruled' && (
				<NumberField
					label="Line spacing (mm)"
					description={`From ${MIN_RULED_LINE_SPACING} to ${MAX_RULED_LINE_SPACING} mm.`}
					value={config.ruledLineSpacing}
					min={MIN_RULED_LINE_SPACING}
					max={MAX_RULED_LINE_SPACING}
					step={0.5}
					onChange={handleRuledLineSpacingChange}
				/>
			)}
			{config.dayPageLines === 'squares' && (
				<NumberField
					label="Square size (mm)"
					description={`From ${MIN_SQUARE_SIZE} to ${MAX_SQUARE_SIZE} mm.`}
					value={config.squareSize}
					min={MIN_SQUARE_SIZE}
					max={MAX_SQUARE_SIZE}
					step={0.5}
					onChange={handleSquareSizeChange}
				/>
			)}
		</Section>
	)
}
