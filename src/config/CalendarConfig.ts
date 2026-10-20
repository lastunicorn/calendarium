import { type Locale, LOCALES, type WeekStartSetting } from '../core/locale'
import type { Orientation, PaperSize } from '../core/paper'
import type { DayPerPageConfig } from './layouts/dayPerPage'
import type { MonthPerPageConfig } from './layouts/monthPerPage'
import type { WeekPerPageConfig } from './layouts/weekPerPage'
import type { YearPerPageConfig } from './layouts/yearPerPage'

// Each set of allowed values is listed once; the type and the validation in `parseConfig`
// derive from the array, and the UI labels are keyed by the type. Sets used by `core/` logic live
// there: locales in `core/locale.ts`, paper sizes and orientations in `core/paper.ts`, weekend
// highlights in `core/weekend.ts`. Sets only one layout uses live in its spec in `config/layouts/`.

/**
 * Ids of the page layouts. Each has a spec in `config/layouts/` (defaults, validators, rules) and
 * a view in `ui/layouts/` (component, form, labels).
 */
export const LAYOUT_IDS = [
	'year-per-page',
	'month-per-page',
	'week-per-page',
	'day-per-page',
] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

export const MARGIN_SIDES = ['top', 'right', 'bottom', 'left'] as const
export type MarginSide = (typeof MARGIN_SIDES)[number]

/** Blank space between the paper edge and the calendar, in mm. */
export type Margins = Record<MarginSide, number>

/** The first full year of the Gregorian calendar, which the printed weekdays and leap days follow. */
export const MIN_YEAR = 1583
export const MAX_YEAR = 9999
export const MAX_MARGIN = 50

export function isYear(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= MIN_YEAR && (value as number) <= MAX_YEAR
}

export function isMargin(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_MARGIN
}

/** The sheet the calendar is printed on. */
export interface PageSetup {
	paperSize: PaperSize
	orientation: Orientation
	margins: Margins
	/** Swaps the left and right margins on even pages, for double-sided printing and binding. */
	mirrorMargins: boolean
}

/** Options every layout has. */
export interface CommonConfig {
	year: number
	/** Language of month and weekday names. */
	locale: Locale
	/** A fixed first day of the week, or `auto` for the language's own. */
	weekStart: WeekStartSetting
	page: PageSetup
}

/**
 * Each layout's own options, declared next to its spec in `config/layouts/`. Keyed by every
 * `LayoutId` (checked below).
 */
export interface LayoutConfigs {
	'year-per-page': YearPerPageConfig
	'month-per-page': MonthPerPageConfig
	'week-per-page': WeekPerPageConfig
	'day-per-page': DayPerPageConfig
}

// Compile-time checks: `LayoutConfigs` has exactly the layout ids, each extending `CommonConfig`.
type Assert<T extends true> = T
export type LayoutConfigsCheck = Assert<
	[keyof LayoutConfigs] extends [LayoutId]
		? [LayoutId] extends [keyof LayoutConfigs]
			? LayoutConfigs extends Record<LayoutId, CommonConfig>
				? true
				: false
			: false
		: false
>

/** Whether `A` and `B` are the same type, not just assignable to each other. */
type Equals<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

/** Every type field `K` has, across the layouts that have it. */
type FieldTypes<K extends PropertyKey> = {
	[L in LayoutId]: K extends keyof LayoutConfigs[L] ? LayoutConfigs[L][K] : never
}[LayoutId]

/** The fields whose type differs between two layouts that have them. */
type MismatchedFields = {
	[L in LayoutId]: {
		[K in keyof LayoutConfigs[L]]: Equals<LayoutConfigs[L][K], FieldTypes<K>> extends true
			? never
			: K
	}[keyof LayoutConfigs[L]]
}[LayoutId]

// Compile-time check: a field name has the same type in every layout that has it, so a file or a
// shared control can't read one layout's value as another's. A failure names the fields; give
// one of them another name. (Meaning can't be checked: a name also means the same in every layout.)
export type SameFieldTypesCheck = Assert<
	[MismatchedFields] extends [never] ? true : MismatchedFields
>

/** The options of any one layout. */
export type LayoutConfig = LayoutConfigs[LayoutId]

/**
 * The app's whole config: which layout is shown, and a remembered set of options per layout.
 * The aggregate root of the settings: changed only by `configReducer`'s commands, which keep every
 * layout's options normalized, and loaded and saved by `storage.ts`, its repository.
 */
export interface AppConfig {
	/** The active layout, whose options the sidebar edits and the preview shows. */
	layout: LayoutId
	layouts: LayoutConfigs
}

/**
 * The browser's language when the calendar has it, so a German browser starts in German.
 * English, of any region, and unsupported languages start in British English.
 */
function defaultLocale(): Locale {
	const language = globalThis.navigator?.language.slice(0, 2)
	if (language === undefined || language === 'en') return 'en-GB'
	return LOCALES.find((locale) => locale.startsWith(language)) ?? 'en-GB'
}

/** The same margin on every side, in mm. */
export function margins(mm: number): Margins {
	return { top: mm, right: mm, bottom: mm, left: mm }
}

/** The options shared by every layout, with the values all layouts start from. */
export function commonDefaults(): CommonConfig {
	return {
		year: new Date().getFullYear(),
		locale: defaultLocale(),
		weekStart: 'auto',
		page: {
			paperSize: 'a4',
			orientation: 'portrait',
			margins: margins(12),
			mirrorMargins: false,
		},
	}
}
