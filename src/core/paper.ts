import { isBoolean, oneOf, type Validators } from './validation'

export const PAPER_SIZES = ['a3', 'a4', 'a5', 'letter'] as const
export type PaperSize = (typeof PAPER_SIZES)[number]

export const ORIENTATIONS = ['portrait', 'landscape'] as const
export type Orientation = (typeof ORIENTATIONS)[number]

interface Paper {
	/** The size's keyword for the CSS `@page { size }` property. */
	cssName: string
	/** Portrait width and height, in mm. */
	width: number
	height: number
}

/** The single source of paper dimensions: preview boxes and the printed `@page` size use it. */
export const PAPERS: Record<PaperSize, Paper> = {
	a3: { cssName: 'A3', width: 297, height: 420 },
	a4: { cssName: 'A4', width: 210, height: 297 },
	a5: { cssName: 'A5', width: 148, height: 210 },
	letter: { cssName: 'letter', width: 215.9, height: 279.4 },
}

/** Width and height of a sheet in mm, as it lies in the given orientation. */
export function pageDimensions(size: PaperSize, orientation: Orientation) {
	const { width, height } = PAPERS[size]
	return orientation === 'portrait' ? { width, height } : { width: height, height: width }
}

export const MARGIN_SIDES = ['top', 'right', 'bottom', 'left'] as const
export type MarginSide = (typeof MARGIN_SIDES)[number]

/** Blank space between the paper edge and the calendar, in mm per side. */
export type Margins = Record<MarginSide, number>

export const MAX_MARGIN = 50

export function isMargin(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_MARGIN
}

/** The same margin on every side, in mm. */
export function margins(mm: number): Margins {
	return { top: mm, right: mm, bottom: mm, left: mm }
}

/** The sheet the calendar is printed on. */
export interface PageSetup {
	paperSize: PaperSize
	orientation: Orientation
	margins: Margins
	/** Swaps the left and right margins on even pages, for double-sided printing and binding. */
	mirrorMargins: boolean
}

/** Margins are checked per side, so one bad side keeps the others. */
const MARGIN_VALIDATORS: Validators<Margins> = {
	top: isMargin,
	right: isMargin,
	bottom: isMargin,
	left: isMargin,
}

export const PAGE_VALIDATORS: Validators<PageSetup> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
	mirrorMargins: isBoolean,
	margins: MARGIN_VALIDATORS,
}

/** Width and height in mm of the area inside the margins, where a layout's content goes. */
export function contentBox(page: Pick<PageSetup, 'paperSize' | 'orientation' | 'margins'>) {
	const { width, height } = pageDimensions(page.paperSize, page.orientation)
	const { top, right, bottom, left } = page.margins
	return { width: width - left - right, height: height - top - bottom }
}

/** Value for `@page { size }`, e.g. `A4 landscape`. */
export function pageSizeCss(size: PaperSize, orientation: Orientation): string {
	return `${PAPERS[size].cssName} ${orientation}`
}
