import {
	type AppConfig,
	LAYOUT_IDS,
	type LayoutConfig,
	type LayoutConfigs,
	type LayoutId,
} from '../CalendarConfig'
import { DAY_PER_PAGE_SPEC } from './dayPerPage'
import type { LayoutSpec } from './LayoutSpec'
import { MONTH_PER_PAGE_SPEC } from './monthPerPage'
import { WEEK_PER_PAGE_SPEC } from './weekPerPage'
import { YEAR_PER_PAGE_SPEC } from './yearPerPage'

/**
 * Each layout's defaults, validators and cross-field rules. Keyed by every `LayoutId`, so a new id
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

export function defaultAppConfig(): AppConfig {
	return { layout: 'year-per-page', layouts: mapLayouts(defaultLayoutConfig) }
}
