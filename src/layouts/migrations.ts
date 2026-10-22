import { WEEKEND_HIGHLIGHTS } from '../core/weekend'

// Helpers shared by the layouts' own migration steps (`LayoutSpec.migrations`).

/** A 3 `highlightWeekends` (`off`, `days`, `columns`) as a 4 on/off; any other value kept as is. */
export function weekendDaysHighlighted(value: unknown): unknown {
	return WEEKEND_HIGHLIGHTS.includes(value as never) ? value !== 'off' : value
}
