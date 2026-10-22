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

/**
 * The edge of the first page that is bound, with mirrored margins: `left` for a book (the back
 * of a sheet is bound on its right), `top` for a flip calendar (the back is bound at its bottom).
 * A right or bottom spine would mirror the same margins, so they are not separate values.
 */
export const SPINES = ['left', 'top'] as const
export type Spine = (typeof SPINES)[number]

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
	/** The size of each page; with `booklet`, the paper printed on holds two (`sheetDimensions`). */
	paperSize: PaperSize
	/** How each page lies; with `booklet`, the paper printed on lies the other way. */
	orientation: Orientation
	margins: Margins
	/**
	 * Every side has the top margin, so editing it sets them all. Off with `mirrorMargins`, which
	 * equal margins would leave unchanged, and when the sides differ (`normalizePage`).
	 */
	equalMargins: boolean
	/**
	 * Swaps the margins on either side of the spine on even pages, for double-sided printing and
	 * binding: left and right for a `left` spine, top and bottom for a `top` one.
	 */
	mirrorMargins: boolean
	/**
	 * Where the pages are bound; only used with `mirrorMargins`. With `booklet`, the fold: on the
	 * left of portrait pages, at the top of landscape ones (`normalizePage`).
	 */
	spine: Spine
	/**
	 * Prints two pages side by side (portrait pages) or one above the other (landscape ones) on
	 * each side of a paper twice their size, ordered so that the sheets, printed double-sided and
	 * folded in half together, make a booklet (`bookletSides`).
	 */
	booklet: boolean
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
	equalMargins: isBoolean,
	mirrorMargins: isBoolean,
	spine: oneOf(SPINES),
	booklet: isBoolean,
	margins: MARGIN_VALIDATORS,
}

/**
 * `page` with its cross-field rules applied: equal margins are off with mirrored margins, and off
 * when the sides differ (as in settings saved before the option), so they never change a margin;
 * a booklet's spine is its fold, on the left of portrait pages and at the top of landscape ones.
 * The same object when it already follows them.
 */
export function normalizePage(page: PageSetup): PageSetup {
	const { top, right, bottom, left } = page.margins
	const equal = right === top && bottom === top && left === top
	const equalMargins = page.equalMargins && equal && !page.mirrorMargins
	const spine = page.booklet ? bookletSpine(page.orientation) : page.spine
	return equalMargins === page.equalMargins && spine === page.spine
		? page
		: { ...page, equalMargins, spine }
}

/** A booklet's fold, on the pages as they lie: two portrait pages side by side fold between them. */
function bookletSpine(orientation: Orientation): Spine {
	return orientation === 'portrait' ? 'left' : 'top'
}

/**
 * Width and height in mm of the paper printed on, as it lies: the page, or for a booklet two pages
 * joined along their long side, so the paper lies the other way (A3 landscape for A4 portrait).
 */
export function sheetDimensions(page: Pick<PageSetup, 'paperSize' | 'orientation' | 'booklet'>) {
	const { width, height } = pageDimensions(page.paperSize, page.orientation)
	if (!page.booklet) return { width, height }
	return page.orientation === 'portrait'
		? { width: 2 * width, height }
		: { width, height: 2 * height }
}

/** Width and height in mm of the area inside the margins, where a layout's content goes. */
export function contentBox(page: Pick<PageSetup, 'paperSize' | 'orientation' | 'margins'>) {
	const { width, height } = pageDimensions(page.paperSize, page.orientation)
	const { top, right, bottom, left } = page.margins
	return { width: width - left - right, height: height - top - bottom }
}

/**
 * Value for `@page { size }`: the paper's name and orientation, e.g. `A4 landscape`, or for a
 * booklet its sheet's size in mm, which may have no name here (A2, for A3 pages).
 */
export function pageSizeCss(
	page: Pick<PageSetup, 'paperSize' | 'orientation' | 'booklet'>,
): string {
	if (!page.booklet) return `${PAPERS[page.paperSize].cssName} ${page.orientation}`
	const { width, height } = sheetDimensions(page)
	return `${width}mm ${height}mm`
}
