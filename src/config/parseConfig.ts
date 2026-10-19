import { isWeekStart } from '../core/calendar'
import { HOUR_FORMATS, LOCALES, WEEKDAY_FORMATS } from '../core/locale'
import { ORIENTATIONS, PAPER_SIZES } from '../core/paper'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'
import {
	type AppConfig,
	type CommonConfig,
	DAY_PAGE_LINES,
	DEFAULTS,
	defaultAppConfig,
	isHour,
	isMargin,
	isYear,
	LAYOUT_IDS,
	type LayoutConfigs,
	type LayoutId,
	MARGIN_SIDES,
	type PageSetup,
} from './CalendarConfig'
import { normalizeLayout } from './normalize'

/**
 * Version of the stored and exported config format. Bump it when a change would misread older
 * data (a renamed or restructured field), and migrate the older shape in `upgrade`.
 *
 * - 1: flat; data without a version also has this shape.
 * - 2: `paperSize`, `orientation` and `margins` grouped under `page`.
 * - 3: one set of options per layout. Storage holds `{ version, layout, layouts: { <id>: {...} } }`;
 *   a file holds one layout's set, flat: `{ version, layout, ...options }` (the version 2 shape).
 */
export const CONFIG_VERSION = 3

/** The app config as written to storage: tagged with its format version. */
export function toStoredConfig(config: AppConfig) {
	return { version: CONFIG_VERSION, ...config }
}

/** One layout's options as written to a file: tagged with the format version and the layout. */
export function toStoredLayoutConfig<K extends LayoutId>(layout: K, config: LayoutConfigs[K]) {
	return { version: CONFIG_VERSION, layout, ...config }
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

/** Values that were once stored under another name, mapped per field to the current one. */
const RENAMED_VALUES: Record<string, Record<string, string>> = {
	// British English was briefly stored as `en-UK`, which is not a valid BCP 47 region.
	locale: { 'en-UK': 'en-GB' },
	layout: { 'year-one-page': 'year-per-page' },
}

/** Replaces each renamed value in `data` with its current name. */
function renameValues(data: StoredData): StoredData {
	const renamed = { ...data }
	for (const [field, names] of Object.entries(RENAMED_VALUES)) {
		const value = renamed[field]
		if (typeof value === 'string' && Object.hasOwn(names, value)) renamed[field] = names[value]
	}
	return renamed
}

function isFlat(stored: StoredData): boolean {
	return stored.version === undefined || stored.version === 1 || stored.version === 2
}

/** Brings flat data (a file, or storage before version 3) of any older version to the current flat shape. */
function upgradeFlat(stored: StoredData): StoredData {
	const current =
		stored.version === undefined || stored.version === 1 ? migrateFromV1(stored) : stored
	return renameValues(current)
}

/** Gives every layout the version 2 flat config; each layout then keeps only its own fields. */
function migrateFromV2(flat: StoredData): StoredData {
	const layouts = Object.fromEntries(LAYOUT_IDS.map((id) => [id, flat]))
	return { layout: flat.layout, layouts }
}

/** Brings stored app data of any older version to the current shape. */
function upgradeApp(stored: StoredData): StoredData {
	if (isFlat(stored)) return migrateFromV2(upgradeFlat(stored))
	const layouts = asObject(stored.layouts) ?? {}
	const renamed = Object.fromEntries(
		Object.entries(layouts).map(([id, data]) => {
			const layout = asObject(data)
			return [id, layout === null ? data : renameValues(layout)]
		}),
	)
	return { ...renameValues(stored), layouts: renamed }
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
const COMMON_VALIDATORS: Validators<CommonConfig, Exclude<keyof CommonConfig, 'page'>> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStart,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}

/** Each layout's validators: the common ones plus its own fields. */
const LAYOUT_VALIDATORS: {
	[K in LayoutId]: Validators<LayoutConfigs[K], Exclude<keyof LayoutConfigs[K], 'page'>>
} = {
	'year-per-page': {
		...COMMON_VALIDATORS,
		title: isString,
		subtitle: isString,
	},
	'month-per-page': COMMON_VALIDATORS,
	'day-per-page': {
		...COMMON_VALIDATORS,
		dayPageLines: oneOf(DAY_PAGE_LINES),
		hourFormat: oneOf(HOUR_FORMATS),
		firstHour: isHour,
		lastHour: isHour,
	},
}

/** Margins are validated per side instead, so one bad side keeps the others. */
const PAGE_VALIDATORS: Validators<PageSetup, Exclude<keyof PageSetup, 'margins'>> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
}

const isLayoutId = oneOf(LAYOUT_IDS)

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

/** Copies the valid fields of stored page data onto `target`. */
function copyValidPage(target: PageSetup, data: unknown) {
	const page = asObject(data)
	if (page === null) return
	copyValid(target, page, PAGE_VALIDATORS)
	const margins = asObject(page.margins)
	if (margins !== null) {
		for (const side of MARGIN_SIDES) {
			if (isMargin(margins[side])) target.margins[side] = margins[side]
		}
	}
}

/**
 * Keeps only the valid fields of one layout's options, falling back to that layout's defaults,
 * then applies the layout's cross-field rules.
 */
function parseCurrentLayoutConfig<K extends LayoutId>(layout: K, data: unknown): LayoutConfigs[K] {
	const config = DEFAULTS[layout]()
	const stored = asObject(data)
	if (stored === null) return config
	copyValid(config, stored, LAYOUT_VALIDATORS[layout])
	copyValidPage(config.page, stored.page)
	return normalizeLayout(layout, config)
}

/** Keeps only the valid fields of untrusted flat data (an imported file) for one layout. */
export function parseLayoutConfig<K extends LayoutId>(layout: K, data: unknown): LayoutConfigs[K] {
	const raw = asObject(data)
	return parseCurrentLayoutConfig(layout, raw === null ? null : upgradeFlat(raw))
}

/**
 * The layout named by untrusted flat data, after renaming old ids; `null` when it names none.
 */
export function parseLayoutId(data: unknown): LayoutId | null {
	const raw = asObject(data)
	if (raw === null) return null
	const { layout } = upgradeFlat(raw)
	return isLayoutId(layout) ? layout : null
}

/** Keeps only valid fields from untrusted stored data, falling back to defaults. */
export function parseConfig(data: unknown): AppConfig {
	const config = defaultAppConfig()
	const raw = asObject(data)
	if (raw === null) return config
	const stored = upgradeApp(raw)

	if (isLayoutId(stored.layout)) config.layout = stored.layout
	const layouts = asObject(stored.layouts) ?? {}
	config.layouts = {
		'year-per-page': parseCurrentLayoutConfig('year-per-page', layouts['year-per-page']),
		'month-per-page': parseCurrentLayoutConfig('month-per-page', layouts['month-per-page']),
		'day-per-page': parseCurrentLayoutConfig('day-per-page', layouts['day-per-page']),
	}
	return config
}
