import { WEEKDAY_FORMATS } from '../../core/locale'
import { HEADING_ALIGNMENTS, HEADING_ALIGNS } from '../../layouts/heading'
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

const HEADING_ALIGNMENT_LABELS = {
	auto: 'Automatic',
	left: 'Left',
	center: 'Center',
	right: 'Right',
}

/** The choices of where a heading sits, for a layout that may put other content beside it. */
export const HEADING_ALIGNMENT_OPTIONS = optionsFrom(HEADING_ALIGNMENTS, HEADING_ALIGNMENT_LABELS)

/** The choices of where a heading sits, for a layout with nothing beside it. */
export const HEADING_ALIGN_OPTIONS = optionsFrom(HEADING_ALIGNS, HEADING_ALIGNMENT_LABELS)
