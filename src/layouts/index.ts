import { sameData } from '../core/data'
import { oneOf, type UntrustedObject } from '../core/validation'
import { DAILY } from './daily'
import type { LayoutSpec } from './LayoutSpec'
import { MONTHLY } from './monthly'
import { WEEKLY } from './weekly'
import { YEARLY } from './yearly'

// Each set of allowed values is listed once; the type and the validation in `parseOptions`
// derive from the array, and the UI labels are keyed by the type. Sets of generic concepts live
// in `core/`: locales in `core/locale.ts`, paper sizes and orientations in `core/paper.ts`,
// weekend highlights in `core/weekend.ts`. Sets only one layout uses live in its folder here.

/**
 * The layouts, in the New project dialog's order; the first is preselected there. Each is a folder here, named
 * after its id, holding all it has (options, defaults, validators, rules, migrations, printed
 * text, and its UI in `ui/`: component, form, labels), and gives its id and spec through its entry
 * point, the folder's `index.ts`. The ids, the options types and the specs all derive from this
 * list; the views are listed in `ui/layouts/registry.ts`.
 */
const LAYOUTS = [YEARLY, MONTHLY, WEEKLY, DAILY] as const

type Layout = (typeof LAYOUTS)[number]

export type LayoutId = Layout['id']

/** The ids of the layouts, in the New project dialog's order. */
export const LAYOUT_IDS: readonly LayoutId[] = LAYOUTS.map((layout) => layout.id)

/** Whether untrusted `value` names a layout. */
export const isLayoutId = oneOf(LAYOUT_IDS)

/** Each layout's own options, declared in its `<layout-id>/options.ts`, keyed by its id. */
export type LayoutOptions = {
	[L in Layout as L['id']]: ReturnType<L['spec']['defaults']>
}

/** The options of any one layout. */
export type AnyLayoutOptions = LayoutOptions[LayoutId]

/** Each layout's spec (defaults, validators, cross-field rules and migrations), by its id. */
// Built from `LAYOUTS`, where each id comes with its own spec.
const LAYOUT_SPECS = Object.fromEntries(LAYOUTS.map(({ id, spec }) => [id, spec])) as {
	[K in LayoutId]: LayoutSpec<LayoutOptions[K]>
}

/** `layout`'s spec, typed by its own options. */
export function layoutSpec<K extends LayoutId>(layout: K): LayoutSpec<LayoutOptions[K]> {
	return LAYOUT_SPECS[layout]
}

/**
 * Untrusted options stored for `layout`, brought from format `version` to the next by that
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
export function defaultLayoutOptions<K extends LayoutId>(layout: K): LayoutOptions[K] {
	return layoutSpec(layout).defaults()
}

/** Whether `options` are `layout`'s defaults, nested fields included: nothing a new project would change. */
export function hasDefaultOptions<K extends LayoutId>(
	layout: K,
	options: LayoutOptions[K],
): boolean {
	return sameData(options, defaultLayoutOptions(layout))
}

/** `options` with its layout's rules applied; the same object when it already follows them. */
export function normalizeLayout<K extends LayoutId>(
	layout: K,
	options: LayoutOptions[K],
): LayoutOptions[K] {
	return layoutSpec(layout).normalize(options)
}

/** Every layout's options, each built by `build` for that layout. */
export function mapLayouts(
	build: <K extends LayoutId>(layout: K) => LayoutOptions[K],
): LayoutOptions {
	const layouts: Partial<Record<LayoutId, AnyLayoutOptions>> = {}
	for (const layout of LAYOUT_IDS) layouts[layout] = build(layout)
	// Every id was filled in, each by `build` with its own layout's options.
	return layouts as LayoutOptions
}
