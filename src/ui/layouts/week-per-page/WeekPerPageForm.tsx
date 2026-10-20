import type { MiniMonthOptions } from '../../../layouts/monthGrid'
import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { CalendarSection } from '../../sidebar/CalendarSection'
import { MiniMonthSection } from '../../sidebar/MiniMonthSection'
import { PageSection } from '../../sidebar/PageSection'
import type { ConfigSectionProps } from '../../sidebar/Section'
import { HeaderSection } from './HeaderSection'
import { WeekPageSection } from './WeekPageSection'

/**
 * The `week-per-page` options, including its header, how each day is labeled and the weekend drawn,
 * and its mini calendar.
 */
export function WeekPerPageForm({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleMiniMonthUpdate(patch: Partial<MiniMonthOptions>) {
		onUpdate({ miniMonth: { ...config.miniMonth, ...patch } })
	}

	return (
		<>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<HeaderSection config={config} onUpdate={onUpdate} />
			<WeekPageSection config={config} onUpdate={onUpdate} />
			<MiniMonthSection config={config.miniMonth} onUpdate={handleMiniMonthUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</>
	)
}
