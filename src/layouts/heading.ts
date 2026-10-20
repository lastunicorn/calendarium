/** Where a page's heading sits across its header row: what `CalendarHeader` takes as `align`. */
export const HEADING_ALIGNS = ['left', 'center', 'right'] as const
export type HeadingAlign = (typeof HEADING_ALIGNS)[number]

/**
 * A `HeadingAlign`, or `auto` for a layout whose header may hold other content: left beside it,
 * centered otherwise. The layout resolves `auto` in its plan.
 */
export const HEADING_ALIGNMENTS = ['auto', ...HEADING_ALIGNS] as const
export type HeadingAlignment = (typeof HEADING_ALIGNMENTS)[number]

/** Bounds of the heading's font size, in pt. */
export const MIN_HEADING_FONT_SIZE = 12
export const MAX_HEADING_FONT_SIZE = 48

/** A heading font size, in pt, from `MIN_HEADING_FONT_SIZE` to `MAX_HEADING_FONT_SIZE`. */
export function isHeadingFontSize(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= MIN_HEADING_FONT_SIZE &&
		value <= MAX_HEADING_FONT_SIZE
	)
}
