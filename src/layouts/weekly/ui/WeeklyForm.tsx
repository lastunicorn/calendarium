import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { FooterSection } from '../../../ui/sidebar/FooterSection'
import { optionsGroup } from '../../../ui/sidebar/optionsGroup'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import type { WeeklyOptions } from '../options'
import { HeaderSection } from './HeaderSection'
import { MiniMonthsSection } from './MiniMonthsSection'
import { WeekContentSection } from './WeekContentSection'

/**
 * The `weekly` options, including its header, how each day is labeled and the weekend drawn,
 * and its mini calendars.
 */
export function WeeklyForm(props: OptionsSectionProps<WeeklyOptions>) {
	return (
		<>
			<CalendarSection {...optionsGroup(props, 'calendar')} />
			<EventsSection {...props} />
			<HeaderSection {...optionsGroup(props, 'header')} />
			<MiniMonthsSection {...optionsGroup(props, 'miniMonth')} />
			<WeekContentSection {...optionsGroup(props, 'content')} />
			<FooterSection {...optionsGroup(props, 'footer')} />
			<PageSection {...optionsGroup(props, 'page')} />
		</>
	)
}
