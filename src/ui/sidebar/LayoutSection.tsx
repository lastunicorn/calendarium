import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { LayoutIcon } from '../components/icons'
import { SelectField } from '../fields/SelectField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import { Section } from './Section'

const LAYOUT_OPTIONS = LAYOUT_IDS.map((layout) => ({
	value: layout,
	label: LAYOUT_VIEWS[layout].label,
}))

interface LayoutSectionProps {
	layout: LayoutId
	/** Shows another layout, with the options it had last. */
	onSelect: (layout: LayoutId) => void
}

/** How the calendar is spread over pages; each layout keeps its own options. */
export function LayoutSection({ layout, onSelect }: LayoutSectionProps) {
	return (
		<Section title="Layout" icon={<LayoutIcon />}>
			<SelectField label="" value={layout} options={LAYOUT_OPTIONS} onChange={onSelect} />
		</Section>
	)
}
