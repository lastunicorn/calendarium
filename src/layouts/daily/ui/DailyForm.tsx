import type { DailyOptions } from '../options'
import { CalendarSection } from '../../../ui/sidebar/CalendarSection'
import { EventsSection } from '../../../ui/sidebar/EventsSection'
import { FooterSection } from '../../../ui/sidebar/FooterSection'
import { MiniMonthSection } from '../../../ui/sidebar/MiniMonthSection'
import { optionsGroup } from '../../../ui/sidebar/optionsGroup'
import { PageSection } from '../../../ui/sidebar/PageSection'
import type { OptionsSectionProps } from '../../../ui/sidebar/Section'
import { DayContentSection } from './DayContentSection'
import { HeaderSection } from './HeaderSection'

/** The `daily` options, including its header, what fills each day and its mini calendar. */
export function DailyForm(props: OptionsSectionProps<DailyOptions>) {
	return (
		<>
			<CalendarSection {...optionsGroup(props, 'calendar')} />
			<EventsSection {...props} />
			<HeaderSection {...optionsGroup(props, 'header')} />
			<MiniMonthSection {...optionsGroup(props, 'miniMonth')} />
			<DayContentSection {...optionsGroup(props, 'content')} />
			<FooterSection {...optionsGroup(props, 'footer')} />
			<PageSection {...optionsGroup(props, 'page')} />
		</>
	)
}
