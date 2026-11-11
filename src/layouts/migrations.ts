import { eventLines } from '../core/events'
import { asObject, type UntrustedObject } from '../core/validation'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'

// Helpers shared by the layouts' own migration steps (`LayoutSpec.migrations`).

/**
 * `options` with the flat fields named by the keys of `fields` moved into the nested object
 * `group`, each under the name its value gives, as 6 groups the flat fields of 5; a field the
 * options don't have is left out, and a group none of them fills is not added. Values are moved
 * as they are.
 */
export function groupFields(
	options: UntrustedObject,
	group: string,
	fields: Readonly<Record<string, string>>,
): UntrustedObject {
	const existing = asObject(options[group])
	const moved: UntrustedObject = { ...existing }
	const rest = { ...options }
	for (const [field, name] of Object.entries(fields)) {
		if (!(field in rest)) continue
		moved[name] = rest[field]
		delete rest[field]
	}
	return existing === null && Object.keys(moved).length === 0 ? rest : { ...rest, [group]: moved }
}

/**
 * 5 options with the fields every layout has as 6 groups them: `year`, `locale` and `weekStart`
 * under `calendar`, and the events, one text, as its lines.
 */
export function commonGroups(options: UntrustedObject): UntrustedObject {
	const grouped = groupFields(options, 'calendar', {
		year: 'year',
		locale: 'locale',
		weekStart: 'weekStart',
	})
	return typeof grouped.events === 'string'
		? { ...grouped, events: eventLines(grouped.events) }
		: grouped
}

/** 5 options with `showFooter` and `footerHeight` as 6's `footer`: `show` and `height`. */
export function footerGroup(options: UntrustedObject): UntrustedObject {
	return groupFields(options, 'footer', { showFooter: 'show', footerHeight: 'height' })
}

/** 5 options with `hourFormat`, `firstHour` and `lastHour` as 6's `schedule`, same names. */
export function scheduleGroup(options: UntrustedObject): UntrustedObject {
	return groupFields(options, 'schedule', {
		hourFormat: 'hourFormat',
		firstHour: 'firstHour',
		lastHour: 'lastHour',
	})
}

/** A 3 `highlightWeekends` (`off`, `days`, `columns`) as a 4 on/off; any other value kept as is. */
export function weekendDaysHighlighted(value: unknown): unknown {
	return WEEKEND_HIGHLIGHTS.includes(value as never) ? value !== 'off' : value
}
