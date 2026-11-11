import {
	DAY_PAGE_FILLS,
	type DayPageFill,
	type DailyOptions,
	MAX_GENKO_YOSHI_SQUARE_SIZE,
	MAX_RULED_LINE_SPACING,
	MAX_SQUARE_SIZE,
	MIN_GENKO_YOSHI_SQUARE_SIZE,
	MIN_RULED_LINE_SPACING,
	MIN_SQUARE_SIZE,
	FILL_ALIGNMENTS,
	type FillAlignment,
	GENKO_YOSHI_DIRECTIONS,
	GENKO_YOSHI_FURIGANA,
	type GenkoYoshiDirection,
	type GenkoYoshiFurigana,
} from '../options'
import { ContentIcon } from '../../../ui/components/icons'
import { CheckboxField } from '../../../ui/fields/CheckboxField'
import { NumberField } from '../../../ui/fields/NumberField'
import { optionsFrom } from '../../../ui/fields/options'
import { RadioField } from '../../../ui/fields/RadioField'
import { ScheduleFields } from '../../../ui/sidebar/ScheduleFields'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

const DAY_PAGE_FILL_OPTIONS = optionsFrom(DAY_PAGE_FILLS, {
	hours: 'Hourly schedule',
	ruled: 'Ruled lines',
	squares: 'Squares',
	dots: 'Dots',
	genkoYoshi: 'Genkō yōshi',
	blank: 'Blank',
})

const GENKO_YOSHI_DIRECTION_OPTIONS = optionsFrom(GENKO_YOSHI_DIRECTIONS, {
	vertical: 'Vertical',
	horizontal: 'Horizontal',
})

const GENKO_YOSHI_FURIGANA_OPTIONS = optionsFrom(GENKO_YOSHI_FURIGANA, {
	none: 'None',
	top: 'Top',
	right: 'Right',
})

const FILL_ALIGNMENT_OPTIONS = optionsFrom(FILL_ALIGNMENTS, {
	left: 'Left',
	center: 'Center',
	right: 'Right',
})

/**
 * What fills a day's page: an hourly schedule and its hours, ruled lines and their spacing,
 * squares or dots, their size and where they sit, genkō yōshi, its size, direction, furigana, guides and where it sits, or
 * nothing, on one page or two.
 */
export function DayContentSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<DailyOptions>) {
	function handleDayPageFillChange(dayPageFill: DayPageFill) {
		onUpdate({ dayPageFill })
	}

	function handleRuledLineSpacingChange(ruledLineSpacing: number) {
		onUpdate({ ruledLineSpacing })
	}

	function handleSquareSizeChange(squareSize: number) {
		onUpdate({ squareSize })
	}

	function handleFillAlignmentChange(fillAlignment: FillAlignment) {
		onUpdate({ fillAlignment })
	}

	function handleGenkoYoshiSquareSizeChange(genkoYoshiSquareSize: number) {
		onUpdate({ genkoYoshiSquareSize })
	}

	function handleGenkoYoshiDirectionChange(genkoYoshiDirection: GenkoYoshiDirection) {
		onUpdate({ genkoYoshiDirection })
	}

	function handleGenkoYoshiFuriganaChange(genkoYoshiFurigana: GenkoYoshiFurigana) {
		onUpdate({ genkoYoshiFurigana })
	}

	function handleGenkoYoshiGuidesChange(genkoYoshiGuides: boolean) {
		onUpdate({ genkoYoshiGuides })
	}

	function handleTwoPagesPerDayChange(twoPagesPerDay: boolean) {
		onUpdate({ twoPagesPerDay })
	}

	function handleReset() {
		onUpdate(
			defaultFields(defaults, [
				'twoPagesPerDay',
				'dayPageFill',
				'hourFormat',
				'firstHour',
				'lastHour',
				'ruledLineSpacing',
				'squareSize',
				'fillAlignment',
				'genkoYoshiSquareSize',
				'genkoYoshiDirection',
				'genkoYoshiFurigana',
				'genkoYoshiGuides',
			]),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<CheckboxField
				label="Two pages per day"
				description={[
					'The header goes on the first page only.',
					'An hourly schedule is split in half across the two.',
				]}
				checked={options.twoPagesPerDay}
				onChange={handleTwoPagesPerDayChange}
			/>
			<RadioField
				label="Fill"
				description="Genkō yōshi is Japanese manuscript paper: columns of squares, one for each character, with room between them for furigana."
				value={options.dayPageFill}
				options={DAY_PAGE_FILL_OPTIONS}
				onChange={handleDayPageFillChange}
			/>
			{options.dayPageFill === 'hours' && (
				<ScheduleFields options={options} onUpdate={onUpdate} />
			)}
			{options.dayPageFill === 'ruled' && (
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
			{options.dayPageFill === 'squares' && (
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
						value={options.fillAlignment}
						options={FILL_ALIGNMENT_OPTIONS}
						onChange={handleFillAlignmentChange}
					/>
				</>
			)}
			{options.dayPageFill === 'dots' && (
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
						value={options.fillAlignment}
						options={FILL_ALIGNMENT_OPTIONS}
						onChange={handleFillAlignmentChange}
					/>
				</>
			)}
			{options.dayPageFill === 'genkoYoshi' && (
				<>
					<NumberField
						label="Square size (mm)"
						description={`From ${MIN_GENKO_YOSHI_SQUARE_SIZE} to ${MAX_GENKO_YOSHI_SQUARE_SIZE} mm. The space between the columns (or rows) grows with it.`}
						value={options.genkoYoshiSquareSize}
						min={MIN_GENKO_YOSHI_SQUARE_SIZE}
						max={MAX_GENKO_YOSHI_SQUARE_SIZE}
						step={0.5}
						onChange={handleGenkoYoshiSquareSizeChange}
					/>
					<RadioField
						label="Writing direction"
						description="Vertical writing goes down columns of squares, a space between the columns; horizontal writing along rows, a space between the rows."
						value={options.genkoYoshiDirection}
						options={GENKO_YOSHI_DIRECTION_OPTIONS}
						onChange={handleGenkoYoshiDirectionChange}
					/>
					<RadioField
						label="Furigana"
						description="A strip for furigana by each square, a third of its size: above it, for horizontal writing, or right of it, for vertical writing."
						value={options.genkoYoshiFurigana}
						options={GENKO_YOSHI_FURIGANA_OPTIONS}
						onChange={handleGenkoYoshiFuriganaChange}
					/>
					<CheckboxField
						label="Guide lines"
						description="Dotted lines dividing each square in half, across and down."
						checked={options.genkoYoshiGuides}
						onChange={handleGenkoYoshiGuidesChange}
					/>
					<RadioField
						label={
							options.genkoYoshiDirection === 'vertical'
								? 'Columns alignment'
								: 'Squares alignment'
						}
						description={`Only whole ${options.genkoYoshiDirection === 'vertical' ? 'columns' : 'squares'} are drawn; the space left goes on the other side, or on both.`}
						value={options.fillAlignment}
						options={FILL_ALIGNMENT_OPTIONS}
						onChange={handleFillAlignmentChange}
					/>
				</>
			)}
		</Section>
	)
}
