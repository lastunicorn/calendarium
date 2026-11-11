import { optionsFrom } from '../../../ui/fields/options'
import { MONTH_SIZES } from '../options'

/** The choices of how large the year page's months are drawn. */
export const MONTH_SIZE_OPTIONS = optionsFrom(MONTH_SIZES, {
	small: 'Small',
	medium: 'Medium',
	large: 'Large',
})
