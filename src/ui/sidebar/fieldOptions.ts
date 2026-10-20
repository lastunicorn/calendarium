import { WEEKDAY_FORMATS } from '../../core/locale'
import { MONTH_GRID_WEEKDAY_FORMATS } from '../../layouts/monthGrid'
import { optionsFrom } from '../fields/options'

const WEEKDAY_FORMAT_LABELS = {
	full: 'Full (MONDAY)',
	short: 'Three letters (MON)',
	narrow: 'One letter (M)',
}

/** The choices of how weekday names are written, for a layout naming weekdays outside a month grid. */
export const WEEKDAY_FORMAT_OPTIONS = optionsFrom(WEEKDAY_FORMATS, WEEKDAY_FORMAT_LABELS)

/** The choices of how a month grid's weekday names are abbreviated; the full names don't fit. */
export const MONTH_GRID_WEEKDAY_FORMAT_OPTIONS = optionsFrom(
	MONTH_GRID_WEEKDAY_FORMATS,
	WEEKDAY_FORMAT_LABELS,
)
