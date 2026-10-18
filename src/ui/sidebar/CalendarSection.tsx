import { type CommonConfig, isYear, MAX_YEAR, MIN_YEAR } from '../../config/CalendarConfig'
import { NumberField } from '../fields/NumberField'
import { type ConfigSectionProps, Section } from './Section'

/** Which year the calendar shows. */
export function CalendarSection({ config, onUpdate }: ConfigSectionProps<CommonConfig>) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	return (
		<Section title="Calendar">
			<NumberField
				label="Year"
				value={config.year}
				min={MIN_YEAR}
				max={MAX_YEAR}
				isValid={isYear}
				onChange={handleYearChange}
			/>
		</Section>
	)
}
