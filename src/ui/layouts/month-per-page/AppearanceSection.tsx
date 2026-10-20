import type { ComponentProps } from 'react'
import { AppearanceIcon } from '../../components/icons'
import { MonthGridFields } from '../../sidebar/MonthGridFields'
import { Section } from '../../sidebar/Section'

/** How the month page's grid looks. */
export function AppearanceSection(props: ComponentProps<typeof MonthGridFields>) {
	return (
		<Section title="Appearance" icon={<AppearanceIcon />}>
			<MonthGridFields {...props} />
		</Section>
	)
}
