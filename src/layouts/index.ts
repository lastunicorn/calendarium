import { oneOf, type UntrustedObject } from '../core/validation'
import type { CommonConfig } from './common'
import { DAY_PER_PAGE_SPEC, type DayPerPageConfig } from './day-per-page'
import type { LayoutSpec } from './LayoutSpec'
import { MONTH_PER_PAGE_SPEC, type MonthPerPageConfig } from './month-per-page'
import { WEEK_PER_PAGE_SPEC, type WeekPerPageConfig } from './week-per-page'
import { YEAR_PER_PAGE_SPEC, type YearPerPageConfig } from './year-per-page'

// Each set of allowed values is listed once; the type and the validation in `parseConfig`
// derive from the array, and the UI labels are keyed by the type. Sets of generic concepts live
// in `core/`: locales in `core/locale.ts`, paper sizes and orientations in `core/paper.ts`,
// weekend highlights in `core/weekend.ts`. Sets only one layout uses live in its folder here.

/**
 * Ids of the page layouts, in the picker's order; the first is shown by default. Each has a folder
 * here (options, defaults, validators, rules, migrations, printed text) and one in `ui/layouts/`
 * (component, form, labels).
 */
export const LAYOUT_IDS = [
	'year-per-page',
	'month-per-page',
	'week-per-page',
	'day-per-page',
] as const
export type LayoutId = (typeof LAYOUT_IDS)[number]

/** Whether untrusted `value` names a layout. */
export const isLayoutId = oneOf(LAYOUT_IDS)

/**
 * Each layout's own options, declared in its `<layout-id>/options.ts`. Keyed by every `LayoutId`
 * (checked below).
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
 * Each layout's defaults, validators, cross-field rules and migrations. Keyed by every `LayoutId`, so a new id
 * without a spec won't compile. The views (component, form, labels) are in `ui/layouts/registry.ts`.
 */
const LAYOUT_SPECS: { [K in LayoutId]: LayoutSpec<LayoutConfigs[K]> } = {
	'year-per-page': YEAR_PER_PAGE_SPEC,
	'month-per-page': MONTH_PER_PAGE_SPEC,
	'week-per-page': WEEK_PER_PAGE_SPEC,
	'day-per-page': DAY_PER_PAGE_SPEC,
}

/** `layout`'s spec, typed by its own options. */
export function layoutSpec<K extends LayoutId>(layout: K): LayoutSpec<LayoutConfigs[K]> {
	return LAYOUT_SPECS[layout]
}

/**
 * Untrusted options stored for `layout`, brought from config `version` to the next by that
 * layout's own step; returned as is for an unknown layout, or one whose options did not change.
 */
export function migrateLayoutOptions(
	layout: unknown,
	version: number,
	options: UntrustedObject,
): UntrustedObject {
	if (!isLayoutId(layout)) return options
	const step = layoutSpec(layout).migrations[version]
	return step === undefined ? options : step(options)
}

/** A fresh copy of `layout`'s default options. */
export function defaultLayoutConfig<K extends LayoutId>(layout: K): LayoutConfigs[K] {
	return layoutSpec(layout).defaults()
}

/** `config` with its layout's rules applied; the same object when it already follows them. */
export function normalizeLayout<K extends LayoutId>(
	layout: K,
	config: LayoutConfigs[K],
): LayoutConfigs[K] {
	return layoutSpec(layout).normalize(config)
}

/** Every layout's options, each built by `build` for that layout. */
export function mapLayouts(
	build: <K extends LayoutId>(layout: K) => LayoutConfigs[K],
): LayoutConfigs {
	const layouts: Partial<Record<LayoutId, LayoutConfig>> = {}
	for (const layout of LAYOUT_IDS) layouts[layout] = build(layout)
	// Every id was filled in, each by `build` with its own layout's options.
	return layouts as LayoutConfigs
}
