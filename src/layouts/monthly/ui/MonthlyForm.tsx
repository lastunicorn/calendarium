import type { MonthlyOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { optionsGroup } from '../../../ui/sidebar/optionsGroup'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { AdjacentMonthsSection } from './AdjacentMonthsSection'
import { HeaderSection } from './HeaderSection'
import { MonthContentSection } from './MonthContentSection'

/** The `monthly` options, including its header and the mini months beside it. */
export function MonthlyForm(props: OptionsSectionProps<MonthlyOptions>) {
	return (
		<>
			<CalendarSection {...optionsGroup(props, 'calendar')} />
			<EventsSection {...props} />
			<HeaderSection {...props} />
			<AdjacentMonthsSection {...optionsGroup(props, 'adjacentMonths')} />
			<MonthContentSection {...props} />
			<PageSection {...optionsGroup(props, 'page')} />
		</>
	)
}
