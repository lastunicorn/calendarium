import type { LayoutConfigs, LayoutId } from '../../layouts'
import { DAY_PER_PAGE_VIEW } from './day-per-page'
import type { LayoutView } from './LayoutView'
import { MONTH_PER_PAGE_VIEW } from './month-per-page'
import { WEEK_PER_PAGE_VIEW } from './week-per-page'
import { YEAR_PER_PAGE_VIEW } from './year-per-page'

/**
 * Each layout's component, form and labels. Keyed by every `LayoutId`, so a new id without a view
 * won't compile. The domain side (options, defaults, validators, rules) is in `layouts/`.
 */
export const LAYOUT_VIEWS: { [K in LayoutId]: LayoutView<LayoutConfigs[K]> } = {
	'year-per-page': YEAR_PER_PAGE_VIEW,
	'month-per-page': MONTH_PER_PAGE_VIEW,
	'week-per-page': WEEK_PER_PAGE_VIEW,
	'day-per-page': DAY_PER_PAGE_VIEW,
}

/** `layout`'s view, typed by its own options, so its component and form stay paired with them. */
export function layoutView<K extends LayoutId>(layout: K): LayoutView<LayoutConfigs[K]> {
	return LAYOUT_VIEWS[layout]
}
