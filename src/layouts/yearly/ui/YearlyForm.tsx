import type { YearlyOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { HeaderSection } from './HeaderSection'
import { YearContentSection } from './YearContentSection'
import { optionsGroup } from '../../../ui/sidebar/optionsGroup'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'

/** The `yearly` options, including the header above the months and how they look. */
export function YearlyForm(props: OptionsSectionProps<YearlyOptions>) {
	return (
		<>
			<CalendarSection {...optionsGroup(props, 'calendar')} />
			<EventsSection {...props} />
			<HeaderSection {...optionsGroup(props, 'header')} calendar={props.options.calendar} />
			<YearContentSection {...optionsGroup(props, 'content')} />
			<PageSection {...optionsGroup(props, 'page')} />
		</>
	)
}
