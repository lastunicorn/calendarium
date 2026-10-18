import type { ComponentType } from 'react'
import type { LayoutConfigs, LayoutId } from '../../config/CalendarConfig'
import { DayPerPageLayout } from './DayPerPageLayout'
import { MonthPerPageLayout } from './MonthPerPageLayout'
import { YearPerPageLayout } from './YearPerPageLayout'

/**
 * The component that draws each layout from that layout's options. A layout renders its own
 * `Page`s, so it decides how many pages there are. Keyed by every `LayoutId`, so a new id without
 * a component won't compile.
 */
export const LAYOUTS: { [K in LayoutId]: ComponentType<{ config: LayoutConfigs[K] }> } = {
	'year-per-page': YearPerPageLayout,
	'month-per-page': MonthPerPageLayout,
	'day-per-page': DayPerPageLayout,
}
