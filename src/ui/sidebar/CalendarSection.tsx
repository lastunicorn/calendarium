import { type CommonConfig, isYear, MAX_YEAR, MIN_YEAR } from '../../config/CalendarConfig'
import { NumberField } from '../fields/NumberField'
import { type ConfigSectionProps, Section } from './Section'

const YEAR_DESCRIPTION = `Min value: ${MIN_YEAR} - The first full year of the Gregorian calendar`

/** Which year the calendar shows. */
export function CalendarSection({ config, onUpdate }: ConfigSectionProps<CommonConfig>) {
	function handleYearChange(year: number) {
		onUpdate({ year })
	}

	return (
		<Section title="Calendar">
			<NumberField
				label="Year"
				description={YEAR_DESCRIPTION}
				value={config.year}
				min={MIN_YEAR}
				max={MAX_YEAR}
				isValid={isYear}
				onChange={handleYearChange}
			/>
		</Section>
	)
}
