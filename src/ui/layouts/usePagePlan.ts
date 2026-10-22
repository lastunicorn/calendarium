import { useMemo } from 'react'
import { calendarModel, type CalendarModel, type CommonOptions } from '../../layouts/common'

/**
 * A layout's pages as `plan` plans them from its options and their calendar model. Memoized on
 * the options, which are a new object only when one of them changes, so an unchanged plan keeps
 * its page objects and the memoized pages drawing them skip rendering.
 */
export function usePagePlan<O extends CommonOptions, P>(
	plan: (options: O, model: CalendarModel) => P,
	options: O,
): P {
	return useMemo(() => plan(options, calendarModel(options)), [plan, options])
}
