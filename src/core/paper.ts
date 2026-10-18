export const PAPER_SIZES = ['a4', 'a3', 'letter'] as const
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
	a4: { cssName: 'A4', width: 210, height: 297 },
	a3: { cssName: 'A3', width: 297, height: 420 },
	letter: { cssName: 'letter', width: 215.9, height: 279.4 },
}

/** Width and height of a sheet in mm, as it lies in the given orientation. */
export function pageDimensions(size: PaperSize, orientation: Orientation) {
	const { width, height } = PAPERS[size]
	return orientation === 'portrait' ? { width, height } : { width: height, height: width }
}

/** Value for `@page { size }`, e.g. `A4 landscape`. */
export function pageSizeCss(size: PaperSize, orientation: Orientation): string {
	return `${PAPERS[size].cssName} ${orientation}`
}
