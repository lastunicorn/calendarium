import type { YearPerPageConfig } from '../../../layouts/year-per-page/options'
import { AppearanceSection } from '../../sidebar/AppearanceSection'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { HeaderSection } from './HeaderSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'

/** The `year-per-page` options, including the header above the months. */
export function YearPerPageForm({ config, onUpdate }: ConfigSectionProps<YearPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<HeaderSection config={config} onUpdate={onUpdate} />
			<AppearanceSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
