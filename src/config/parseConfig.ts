import { isWeekStart } from '../core/calendar'
import { WEEKDAY_FORMATS } from '../core/locale'
import { ORIENTATIONS, PAPER_SIZES } from '../core/paper'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'
import {
	type CalendarConfig,
	defaultConfig,
	isMargin,
	isYear,
	LAYOUT_IDS,
	LOCALES,
	MARGIN_SIDES,
} from './CalendarConfig'

/**
 * Version of the stored and exported config format. Bump it when a change would misread older
 * data (a renamed or restructured field), and migrate the older shape in `parseConfig`.
 * Data without a version predates versioning and has the version 1 shape.
 */
export const CONFIG_VERSION = 1

/** The config as written to storage and files: tagged with its format version. */
export function toStoredConfig(config: CalendarConfig) {
	return { version: CONFIG_VERSION, ...config }
}

function oneOf<T>(values: readonly T[]) {
	return (value: unknown): value is T => values.includes(value as T)
}

function isString(value: unknown): value is string {
	return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean'
}

type Validator<T> = (value: unknown) => value is T

/** Margins are validated per side instead, so one bad side keeps the others. */
type ValidatedKey = Exclude<keyof CalendarConfig, 'margins'>

// A mapped type: a new config field without a validator here is a compile error.
const VALIDATORS: { [K in ValidatedKey]: Validator<CalendarConfig[K]> } = {
	layout: oneOf(LAYOUT_IDS),
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStart,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	title: isString,
	subtitle: isString,
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
}

function copyIfValid<K extends ValidatedKey>(
	config: CalendarConfig,
	stored: Record<string, unknown>,
	key: K,
) {
	const value = stored[key]
	if (VALIDATORS[key](value)) config[key] = value
}

/** Keeps only valid fields from untrusted stored data, falling back to defaults. */
export function parseConfig(data: unknown): CalendarConfig {
	const config = defaultConfig()
	if (typeof data !== 'object' || data === null) return config
	const stored = data as Record<string, unknown>

	for (const key of Object.keys(VALIDATORS) as ValidatedKey[]) {
		copyIfValid(config, stored, key)
	}

	if (typeof stored.margins === 'object' && stored.margins !== null) {
		const margins = stored.margins as Record<string, unknown>
		for (const side of MARGIN_SIDES) {
			if (isMargin(margins[side])) config.margins[side] = margins[side]
		}
	}

	return config
}
