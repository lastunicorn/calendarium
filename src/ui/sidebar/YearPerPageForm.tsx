import type { YearPerPageConfig } from '../../config/CalendarConfig'
import { AppearanceSection } from './AppearanceSection'
import { CalendarSection } from './CalendarSection'
import { HeaderSection } from './HeaderSection'
import { PageSection } from './PageSection'
import type { ConfigSectionProps } from './Section'

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
