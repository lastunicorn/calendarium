import type { WeekPerPageConfig } from '../../../layouts/week-per-page/options'
import { HeaderIcon } from '../../components/icons'
import { CheckboxField } from '../../fields/CheckboxField'
import { type ConfigSectionProps, Section } from '../../sidebar/Section'

/** What a week's heading shows besides the dates of its days. */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps<WeekPerPageConfig>) {
	function handleShowHeaderWeekChange(showHeaderWeek: boolean) {
		onUpdate({ showHeaderWeek })
	}

	return (
		<Section title="Header" icon={<HeaderIcon />}>
			<CheckboxField
				label="Show week number"
				checked={config.showHeaderWeek}
				onChange={handleShowHeaderWeekChange}
			/>
		</Section>
	)
}
