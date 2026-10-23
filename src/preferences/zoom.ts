import { oneOf } from '../core/validation'

/** The zoom levels the menu lists and the buttons step through, in percent of the printed size. */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]

/** The lowest and highest zooms, in percent: the lowest and highest levels. */
export const MIN_ZOOM = ZOOM_LEVELS[0]
export const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1]

/**
 * Zooms sized from the preview, so they follow it as it is resized: the sheet fills the preview's
 * width, or a whole sheet fits in it.
 */
export const ZOOM_FITS = ['fit-width', 'fit-page'] as const
export type ZoomFit = (typeof ZOOM_FITS)[number]

/**
 * How large the preview draws the pages: a whole percent of their printed size, from `MIN_ZOOM` to
 * `MAX_ZOOM` (a level, or in between when pinched or zoomed with the wheel), or a fit.
 */
export type PreviewZoom = number | ZoomFit

/** The levels and the fits, in the order the zoom menu lists them. */
export const PREVIEW_ZOOMS: readonly PreviewZoom[] = [...ZOOM_LEVELS, ...ZOOM_FITS]

/** The pages at their printed size. */
export const DEFAULT_ZOOM: PreviewZoom = 100

const isZoomFit = oneOf(ZOOM_FITS)

/** A whole percent from `MIN_ZOOM` to `MAX_ZOOM`, or a fit. */
export function isPreviewZoom(value: unknown): value is PreviewZoom {
	if (typeof value !== 'number') return isZoomFit(value)
	return Number.isInteger(value) && value >= MIN_ZOOM && value <= MAX_ZOOM
}

/** A width and a height, in the same unit. */
export interface Size {
	width: number
	height: number
}

const MIN_SCALE = MIN_ZOOM / 100
const MAX_SCALE = MAX_ZOOM / 100

/** `scale` kept between the lowest and the highest zooms. */
function clampScale(scale: number): number {
	return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE)
}

/**
 * The factor the pages are drawn at for `zoom`: a percent's own, or for a fit the one fitting
 * `sheet` in `area` (both in the same unit), kept between the lowest and the highest zooms.
 */
export function zoomScale(zoom: PreviewZoom, sheet: Size, area: Size): number {
	if (typeof zoom === 'number') return zoom / 100
	const widthScale = area.width / sheet.width
	const scale =
		zoom === 'fit-width' ? widthScale : Math.min(widthScale, area.height / sheet.height)
	return clampScale(scale)
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

/** The zoom drawing the pages at `scale`, rounded to a whole percent, from `MIN_ZOOM` to `MAX_ZOOM`. */
export function zoomAt(scale: number): number {
	return Math.round(clampScale(scale) * 100)
}
