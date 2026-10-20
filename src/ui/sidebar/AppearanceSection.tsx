import type { ComponentProps } from 'react'
import { AppearanceIcon } from '../components/icons'
import { MonthGridFields } from './MonthGridFields'
import { Section } from './Section'

/** How the layout's month grids look. */
export function AppearanceSection(props: ComponentProps<typeof MonthGridFields>) {
	return (
		<Section title="Appearance" icon={<AppearanceIcon />}>
			<MonthGridFields {...props} />
		</Section>
	)
}
