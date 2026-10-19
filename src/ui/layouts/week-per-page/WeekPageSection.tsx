import type { WeekPerPageConfig } from '../../../config/layouts/weekPerPage'
import { WEEKEND_DISPLAYS, type WeekendDisplay } from '../../../core/weekend'
import { DayPageIcon } from '../../components/icons'
import { optionsFrom } from '../../fields/options'
import { RadioField } from '../../fields/RadioField'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

const WEEKEND_DISPLAY_OPTIONS = optionsFrom(WEEKEND_DISPLAYS, {
	full: 'Full',
	collapsed: 'Reduced (One shared cell)',
	off: 'Hidden',
})

/** How a week's page is divided between its days. */
export function WeekPageSection({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleWeekendDisplayChange(weekendDisplay: WeekendDisplay) {
		onUpdate({ weekendDisplay })
	}

	return (
		<Section title="Week page" icon={<DayPageIcon />}>
			<RadioField
				label="Weekend"
				value={config.weekendDisplay}
				options={WEEKEND_DISPLAY_OPTIONS}
				onChange={handleWeekendDisplayChange}
			/>
		</Section>
	)
}
