import type { MonthGridOptions } from '../../layouts/monthGrid'
import { AppearanceIcon } from '../components/icons'
import { MonthGridFields } from './MonthGridFields'
import { type ConfigSectionProps, Section } from './Section'

/** How the layout's month grids look. */
export function AppearanceSection({ config, onUpdate }: ConfigSectionProps<MonthGridOptions>) {
	return (
		<Section title="Appearance" icon={<AppearanceIcon />}>
			<MonthGridFields config={config} onUpdate={onUpdate} />
		</Section>
	)
}
