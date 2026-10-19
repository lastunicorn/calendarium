import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { WeekPageSection } from './WeekPageSection'

/** The `week-per-page` options, including how each day is labeled and the weekend drawn. */
export function WeekPerPageForm({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<WeekPageSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
