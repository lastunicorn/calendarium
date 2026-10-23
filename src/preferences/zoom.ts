/** The zoom levels the preview steps through, in percent of the pages' printed size. */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]

/**
 * Zooms sized from the preview, so they follow it as it is resized: the sheet fills the preview's
 * width, or a whole sheet fits in it.
 */
export const ZOOM_FITS = ['fit-width', 'fit-page'] as const
export type ZoomFit = (typeof ZOOM_FITS)[number]

/** How large the preview draws the pages: a fixed level, or a fit. */
export type PreviewZoom = ZoomLevel | ZoomFit

/** Every zoom, in the order the zoom menu lists them. */
export const PREVIEW_ZOOMS: readonly PreviewZoom[] = [...ZOOM_LEVELS, ...ZOOM_FITS]

/** The pages at their printed size. */
export const DEFAULT_ZOOM: PreviewZoom = 100

/** A width and a height, in the same unit. */
export interface Size {
	width: number
	height: number
}

const MIN_SCALE = ZOOM_LEVELS[0] / 100
const MAX_SCALE = ZOOM_LEVELS[ZOOM_LEVELS.length - 1] / 100

/**
 * The factor the pages are drawn at for `zoom`: a level's own, or for a fit the one fitting `sheet`
 * in `area` (both in the same unit), kept between the lowest and the highest levels.
 */
export function zoomScale(zoom: PreviewZoom, sheet: Size, area: Size): number {
	if (typeof zoom === 'number') return zoom / 100
	const widthScale = area.width / sheet.width
	const scale =
		zoom === 'fit-width' ? widthScale : Math.min(widthScale, area.height / sheet.height)
	return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE)
}

/** Ignores the rounding of a fit's scale landing next to a level. */
const EPSILON = 0.001

/** The level after `scale`, from a level or a fit; `null` at the highest. */
export function zoomedIn(scale: number): ZoomLevel | null {
	return ZOOM_LEVELS.find((level) => level / 100 > scale + EPSILON) ?? null
}

/** The level before `scale`, from a level or a fit; `null` at the lowest. */
export function zoomedOut(scale: number): ZoomLevel | null {
	return ZOOM_LEVELS.findLast((level) => level / 100 < scale - EPSILON) ?? null
}
