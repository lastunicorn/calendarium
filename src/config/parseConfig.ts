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
	type PageSetup,
} from './CalendarConfig'

/**
 * Version of the stored and exported config format. Bump it when a change would misread older
 * data (a renamed or restructured field), and migrate the older shape in `upgrade`.
 *
 * - 1: flat; data without a version also has this shape.
 * - 2: `paperSize`, `orientation` and `margins` grouped under `page`.
 */
export const CONFIG_VERSION = 2

/** The config as written to storage and files: tagged with its format version. */
export function toStoredConfig(config: CalendarConfig) {
	return { version: CONFIG_VERSION, ...config }
}

type StoredData = Record<string, unknown>

/** `value` as an object whose fields can be read, or `null` when it is not a plain object. */
function asObject(value: unknown): StoredData | null {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as StoredData)
		: null
}

/** Moves the version 1 top-level page fields under `page`. */
function migrateFromV1({ paperSize, orientation, margins, ...rest }: StoredData): StoredData {
	return { ...rest, page: { paperSize, orientation, margins } }
}

/** Brings stored data of any older version to the current shape. */
function upgrade(stored: StoredData): StoredData {
	if (stored.version === undefined || stored.version === 1) return migrateFromV1(stored)
	return stored
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

/** One validator per listed field of `T`. As a mapped type, a missing one is a compile error. */
type Validators<T, K extends keyof T> = { [P in K]: Validator<T[P]> }

/** `page` is an object, validated by its own fields below. */
const CONFIG_VALIDATORS: Validators<CalendarConfig, Exclude<keyof CalendarConfig, 'page'>> = {
	layout: oneOf(LAYOUT_IDS),
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStart,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	title: isString,
	subtitle: isString,
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}

/** Margins are validated per side instead, so one bad side keeps the others. */
const PAGE_VALIDATORS: Validators<PageSetup, Exclude<keyof PageSetup, 'margins'>> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
}

/** Copies each field of `source` that passes its validator onto `target`. */
function copyValid<T, K extends keyof T>(
	target: T,
	source: StoredData,
	validators: Validators<T, K>,
) {
	for (const key of Object.keys(validators) as K[]) {
		const value = source[key as string]
		if (validators[key](value)) target[key] = value
	}
}

/** Keeps only valid fields from untrusted stored data, falling back to defaults. */
export function parseConfig(data: unknown): CalendarConfig {
	const config = defaultConfig()
	const raw = asObject(data)
	if (raw === null) return config
	const stored = upgrade(raw)

	copyValid(config, stored, CONFIG_VALIDATORS)

	const page = asObject(stored.page)
	if (page !== null) {
		copyValid(config.page, page, PAGE_VALIDATORS)
		const margins = asObject(page.margins)
		if (margins !== null) {
			for (const side of MARGIN_SIDES) {
				if (isMargin(margins[side])) config.page.margins[side] = margins[side]
			}
		}
	}

	return config
}
