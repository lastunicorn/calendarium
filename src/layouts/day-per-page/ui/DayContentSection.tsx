import {
	DAY_PAGE_LINES,
	type DayPageLines,
	type DayPerPageOptions,
	MAX_RULED_LINE_SPACING,
	MAX_SQUARE_SIZE,
	MIN_RULED_LINE_SPACING,
	MIN_SQUARE_SIZE,
	SQUARE_GRID_ALIGNMENTS,
	type SquareGridAlignment,
} from '../options'
import { ContentIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { NumberField } from '../../../ui/fields/NumberField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { ScheduleFields } from '../../../ui/sidebar/ScheduleFields'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const DAY_PAGE_LINES_OPTIONS = optionsFrom(DAY_PAGE_LINES, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
	squares: 'Squares',
	dots: 'Dots',
	blank: 'Blank',
})

const SQUARE_GRID_ALIGNMENT_OPTIONS = optionsFrom(SQUARE_GRID_ALIGNMENTS, {
	left: 'Left',
	center: 'Center',
	right: 'Right',
})

/**
 * What fills a day's page: an hourly schedule and its hours, ruled lines and their spacing, or
 * squares or dots, their size and where they sit, or nothing, on one page or two.
 */
export function DayContentSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<DayPerPageOptions>) {
	function handleDayPageLinesChange(dayPageLines: DayPageLines) {
		onUpdate({ dayPageLines })
	}

	function handleRuledLineSpacingChange(ruledLineSpacing: number) {
		onUpdate({ ruledLineSpacing })
	}

	function handleSquareSizeChange(squareSize: number) {
		onUpdate({ squareSize })
	}

	function handleSquareGridAlignmentChange(squareGridAlignment: SquareGridAlignment) {
		onUpdate({ squareGridAlignment })
	}

	function handleTwoPagesPerDayChange(twoPagesPerDay: boolean) {
		onUpdate({ twoPagesPerDay })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'twoPagesPerDay',
				'dayPageLines',
				'hourFormat',
				'firstHour',
				'lastHour',
				'ruledLineSpacing',
				'squareSize',
				'squareGridAlignment',
			]),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<CheckboxField
				label="Two pages per day"
				description="The header goes on the first page only; an hourly schedule is split in half across the two."
				checked={options.twoPagesPerDay}
				onChange={handleTwoPagesPerDayChange}
			/>
			<RadioField
				label="Fill"
				value={options.dayPageLines}
				options={DAY_PAGE_LINES_OPTIONS}
				onChange={handleDayPageLinesChange}
			/>
			{options.dayPageLines === 'hours' && (
				<ScheduleFields options={options} onUpdate={onUpdate} />
			)}
			{options.dayPageLines === 'ruled' && (
				<NumberField
					label="Line spacing (mm)"
					description={`From ${MIN_RULED_LINE_SPACING} to ${MAX_RULED_LINE_SPACING} mm.`}
					value={options.ruledLineSpacing}
					min={MIN_RULED_LINE_SPACING}
					max={MAX_RULED_LINE_SPACING}
					step={0.5}
					onChange={handleRuledLineSpacingChange}
				/>
			)}
			{options.dayPageLines === 'squares' && (
				<>
					<NumberField
						label="Square size (mm)"
						description={`From ${MIN_SQUARE_SIZE} to ${MAX_SQUARE_SIZE} mm.`}
						value={options.squareSize}
						min={MIN_SQUARE_SIZE}
						max={MAX_SQUARE_SIZE}
						step={0.5}
						onChange={handleSquareSizeChange}
					/>
					<RadioField
						label="Squares alignment"
						description="Only whole squares are drawn; the space left goes on the other side, or on both."
						value={options.squareGridAlignment}
						options={SQUARE_GRID_ALIGNMENT_OPTIONS}
						onChange={handleSquareGridAlignmentChange}
					/>
				</>
			)}
			{options.dayPageLines === 'dots' && (
				<>
					<NumberField
						label="Dot spacing (mm)"
						description={`From ${MIN_SQUARE_SIZE} to ${MAX_SQUARE_SIZE} mm.`}
						value={options.squareSize}
						min={MIN_SQUARE_SIZE}
						max={MAX_SQUARE_SIZE}
						step={0.5}
						onChange={handleSquareSizeChange}
					/>
					<RadioField
						label="Dots alignment"
						description="The dots mark the corners of whole squares only; the space left goes on the other side, or on both."
						value={options.squareGridAlignment}
						options={SQUARE_GRID_ALIGNMENT_OPTIONS}
						onChange={handleSquareGridAlignmentChange}
					/>
				</>
			)}
		</Section>
	)
}
