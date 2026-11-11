import type { LayoutOptions, LayoutId } from '../../layouts'
import { DAILY_VIEW } from '../../layouts/daily/ui'
import type { LayoutView } from './LayoutView'
import { MONTHLY_VIEW } from '../../layouts/monthly/ui'
import { WEEKLY_VIEW } from '../../layouts/weekly/ui'
import { YEARLY_VIEW } from '../../layouts/yearly/ui'

/**
 * Each layout's component, form and labels. Keyed by every `LayoutId`, so a new id without a view
 * won't compile. The domain side (options, defaults, validators, rules) is in `layouts/`.
 */
export const LAYOUT_VIEWS: { [K in LayoutId]: LayoutView<LayoutOptions[K]> } = {
	yearly: YEARLY_VIEW,
	monthly: MONTHLY_VIEW,
	weekly: WEEKLY_VIEW,
	daily: DAILY_VIEW,
}

/** `layout`'s view, typed by its own options, so its component and form stay paired with them. */
export function layoutView<K extends LayoutId>(layout: K): LayoutView<LayoutOptions[K]> {
	return LAYOUT_VIEWS[layout]
}
