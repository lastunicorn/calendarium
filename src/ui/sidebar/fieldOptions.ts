import { WEEKDAY_FORMATS } from '../../core/locale'
import { optionsFrom } from '../fields/options'

/** The choices of how weekday names are abbreviated, for every layout that names weekdays. */
export const WEEKDAY_FORMAT_OPTIONS = optionsFrom(WEEKDAY_FORMATS, {
	short: 'Three letters (MON)',
	narrow: 'One letter (M)',
})
