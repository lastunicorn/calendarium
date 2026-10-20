import type { ComponentProps } from 'react'
import { ContentIcon } from '../../components/icons'
import { MonthGridFields } from '../../sidebar/MonthGridFields'
import { Section } from '../../sidebar/Section'

/** How the page's twelve months look. */
export function ContentSection(props: ComponentProps<typeof MonthGridFields>) {
	return (
		<Section title="Content" icon={<ContentIcon />}>
			<MonthGridFields {...props} />
		</Section>
	)
}
