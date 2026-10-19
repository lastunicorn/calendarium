import { LAYOUT_IDS, type LayoutId } from '../../config/CalendarConfig'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { Section } from './Section'

const LAYOUT_OPTIONS = optionsFrom(LAYOUT_IDS, {
	'year-per-page': 'Year (Whole year on one page)',
	'month-per-page': 'Month (One month per page)',
	'day-per-page': 'Day (One day per page)',
})

interface LayoutSectionProps {
	layout: LayoutId
	/** Shows another layout, with the options it had last. */
	onSelect: (layout: LayoutId) => void
}

/** How the calendar is spread over pages; each layout keeps its own options. */
export function LayoutSection({ layout, onSelect }: LayoutSectionProps) {
	return (
		<Section title="Layout">
			<SelectField
				label="Pages"
				value={layout}
				options={LAYOUT_OPTIONS}
				onChange={onSelect}
			/>
		</Section>
	)
}
