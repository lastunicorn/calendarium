import type { MonthPerPageConfig } from '../../../layouts/month-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { ContentSection } from '../../sidebar/ContentSection'
import { WEEKDAY_FORMAT_OPTIONS } from '../../sidebar/fieldOptions'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { HeaderSection } from './HeaderSection'

/** The `month-per-page` options, including its header. */
export function MonthPerPageForm({ config, onUpdate }: ConfigSectionProps<MonthPerPageConfig>) {
	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<HeaderSection config={config} onUpdate={onUpdate} />
			<ContentSection
				config={config}
				onUpdate={onUpdate}
				weekdayFormats={WEEKDAY_FORMAT_OPTIONS}
			/>
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
