import type { ComponentType } from 'react'
import type { LayoutConfigs, LayoutId } from '../../config/CalendarConfig'
import { DayPerPageForm } from './DayPerPageForm'
import { MonthPerPageForm } from './MonthPerPageForm'
import type { ConfigSectionProps } from './Section'
import { YearPerPageForm } from './YearPerPageForm'

/**
 * Each layout's options form: the sections for the options it has. Keyed by every `LayoutId`, so
 * a new id without a form won't compile.
 */
export const FORMS: { [K in LayoutId]: ComponentType<ConfigSectionProps<LayoutConfigs[K]>> } = {
	'year-per-page': YearPerPageForm,
	'month-per-page': MonthPerPageForm,
	'day-per-page': DayPerPageForm,
}
