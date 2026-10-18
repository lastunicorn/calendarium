import { LAYOUT_IDS, type LayoutId } from '../../config/CalendarConfig'
import { optionsFrom } from '../fields/options'
import { SelectField } from '../fields/SelectField'
import { type ConfigSectionProps, Section } from './Section'

const LAYOUT_OPTIONS = optionsFrom(LAYOUT_IDS, {
	'year-one-page': 'Year (Whole year on one page)',
	'month-per-page': 'Month (One month per page)',
})

/** How the calendar is spread over pages. */
export function LayoutSection({ config, onUpdate }: ConfigSectionProps) {
	function handleLayoutChange(layout: LayoutId) {
		onUpdate({ layout })
	}

	return (
		<Section title="Layout">
			<SelectField
				label="Pages"
				value={config.layout}
				options={LAYOUT_OPTIONS}
				onChange={handleLayoutChange}
			/>
		</Section>
	)
}
