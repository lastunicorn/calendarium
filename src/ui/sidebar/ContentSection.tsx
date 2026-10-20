import type { ComponentProps } from 'react'
import type { MonthGridOptions } from '../../layouts/monthGrid'
import { ContentIcon } from '../components/icons'
import { defaultFields } from './defaultFields'
import { MonthGridFields } from './MonthGridFields'
import { type ConfigSectionProps, Section } from './Section'

type ContentSectionProps = ComponentProps<typeof MonthGridFields> &
	ConfigSectionProps<MonthGridOptions>

/** How the layout's month grids look. */
export function ContentSection({ defaults, ...props }: ContentSectionProps) {
	function handleReset() {
		props.onUpdate(
			defaultFields(defaults, ['weekdayFormat', 'highlightWeekends', 'showWeekNumbers']),
		)
	}

	return (
		<Section title="Content" icon={<ContentIcon />} onReset={handleReset}>
			<MonthGridFields {...props} />
		</Section>
	)
}
