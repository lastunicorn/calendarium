import type { CommonConfig } from '../../layouts/common'
import { invalidEventLines } from '../../core/events'
import { EventsIcon } from '../components/icons'
import { TextAreaField } from '../fields/TextAreaField'
import { type ConfigSectionProps, Section } from './Section'

const EVENTS_DESCRIPTION = [
	'One event per line: its date as year-month-day, a space, then its name, e.g. 2026-04-05 Easter.',
	'The year 0000 repeats an event every year, e.g. 0000-12-25 Christmas.',
	'The month layout writes the names in the days’ cells, the week layout under the days’ labels and the day layout under the page’s heading. The year layout circles their days and lists them on a second page.',
]

const EVENTS_PLACEHOLDER = '0000-01-01 New Year\n0000-12-25 Christmas\n2026-04-05 Easter'

/** A warning naming the lines of `events` that aren't an event, or none when all are. */
function eventsError(events: string): string | undefined {
	const lines = invalidEventLines(events)
	if (lines.length === 0) return undefined
	const which = lines.length === 1 ? `Line ${lines[0]} is` : `Lines ${lines.join(', ')} are`
	return `${which} not a date and a name (YYYY-MM-DD Name), so not printed.`
}

/** The calendar's events, one per line. */
export function EventsSection({ config, defaults, onUpdate }: ConfigSectionProps<CommonConfig>) {
	function handleEventsChange(events: string) {
		onUpdate({ events })
	}

	function handleReset() {
		onUpdate({ events: defaults.events })
	}

	return (
		<Section title="Events" icon={<EventsIcon />} onReset={handleReset}>
			<TextAreaField
				label="Events"
				description={EVENTS_DESCRIPTION}
				value={config.events}
				placeholder={EVENTS_PLACEHOLDER}
				error={eventsError(config.events)}
				onChange={handleEventsChange}
			/>
		</Section>
	)
}
