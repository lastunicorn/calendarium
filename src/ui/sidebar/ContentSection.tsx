import type { ComponentProps } from 'react'
import { ContentIcon } from '../components/icons'
import { MonthGridFields } from './MonthGridFields'
import { Section } from './Section'

/** How the layout's month grids look. */
export function ContentSection(props: ComponentProps<typeof MonthGridFields>) {
	return (
		<Section title="Content" icon={<ContentIcon />}>
			<MonthGridFields {...props} />
		</Section>
	)
}
