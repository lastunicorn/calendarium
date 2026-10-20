/** Where a page's heading sits across its header row: what `CalendarHeader` takes as `align`. */
export const HEADING_ALIGNS = ['left', 'center', 'right'] as const
export type HeadingAlign = (typeof HEADING_ALIGNS)[number]

/**
 * A `HeadingAlign`, or `auto` for a layout whose header may hold other content: left beside it,
 * centered otherwise. The layout resolves `auto` in its plan.
 */
export const HEADING_ALIGNMENTS = ['auto', ...HEADING_ALIGNS] as const
export type HeadingAlignment = (typeof HEADING_ALIGNMENTS)[number]
