import { useMemo } from 'react'
import { calendarModel, type CalendarModel, type CommonConfig } from '../../layouts/common'

/**
 * A layout's pages as `plan` plans them from its options and their calendar model. Memoized on
 * the options, which are a new object only when one of them changes, so an unchanged plan keeps
 * its page objects and the memoized pages drawing them skip rendering.
 */
export function usePagePlan<C extends CommonConfig, P>(
	plan: (config: C, model: CalendarModel) => P,
	config: C,
): P {
	return useMemo(() => plan(config, calendarModel(config)), [plan, config])
}
