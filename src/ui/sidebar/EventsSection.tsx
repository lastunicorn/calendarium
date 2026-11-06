import type { CommonOptions } from '../../layouts/common'
import { invalidEventLines } from '../../core/events'
import { EventsIcon } from '../components/icons'
import { TextAreaField } from '../fields/TextAreaField'
import { type OptionsSectionProps, Section } from './Section'

/** A warning naming the lines of `events` that aren't an event, or none when all are. */
function eventsError(events: string): string | undefined {
	const lines = invalidEventLines(events)
	if (lines.length === 0) return undefined
	const which = lines.length === 1 ? `Line ${lines[0]} is` : `Lines ${lines.join(', ')} are`
	return `${which} not a date and a name (YYYY-MM-DD Name), so not printed.`
}

/** The calendar's events, one per line. */
export function EventsSection({ options, defaults, onUpdate }: OptionsSectionProps<CommonOptions>) {
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
				description={[
					'One event per line: year-month-day, a space, then its name, e.g. "2026-04-05 Easter".',
					'Use year 0000 to repeat an event every year, e.g. "0000-12-25 Christmas".',
					'Each layout decides by itself how to display the events.',
				]}
				value={options.events}
				placeholder={'0000-01-01 New Year\n0000-12-25 Christmas\n2026-04-05 Easter'}
				rows={10}
				error={eventsError(options.events)}
				onChange={handleEventsChange}
			/>
		</Section>
	)
}
