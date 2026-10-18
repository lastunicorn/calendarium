import type { ComponentType } from 'react'
import type { CalendarConfig, LayoutId } from '../../config/CalendarConfig'
import { YearOnePageLayout } from './YearOnePageLayout'

/**
 * The component that draws each layout. A layout renders its own `Page`s, so it decides how
 * many pages there are. Keyed by every `LayoutId`, so a new id without a component won't compile.
 */
export const LAYOUTS: Record<LayoutId, ComponentType<{ config: CalendarConfig }>> = {
	'year-one-page': YearOnePageLayout,
}
