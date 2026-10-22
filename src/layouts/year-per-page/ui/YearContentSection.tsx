import type { ComponentProps } from 'react'
import type { MonthGridOptions } from '../../monthGrid'
import { ContentIcon } from '../../../ui/components/icons'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { MonthGridFields } from '../../../ui/sidebar/MonthGridFields'
import { type ConfigSectionProps, Section } from '../../../ui/sidebar/Section'

type YearContentSectionProps = ComponentProps<typeof MonthGridFields> &
	ConfigSectionProps<MonthGridOptions>

/** How the year page's month grids look. */
export function YearContentSection({ defaults, ...props }: YearContentSectionProps) {
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
