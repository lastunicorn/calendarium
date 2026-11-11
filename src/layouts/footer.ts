import { isBoolean, type Validators } from '../core/validation'

/** Bounds of the height of a page's empty footer, in mm. */
export const MIN_FOOTER_HEIGHT = 5
export const MAX_FOOTER_HEIGHT = 100

/** A footer's height: whole mm, from `MIN_FOOTER_HEIGHT` to `MAX_FOOTER_HEIGHT`. */
export function isFooterHeight(value: unknown): value is number {
	return (
		Number.isInteger(value) &&
		(value as number) >= MIN_FOOTER_HEIGHT &&
		(value as number) <= MAX_FOOTER_HEIGHT
	)
}

/**
 * The options of an empty bordered footer at the bottom of every sheet, the `footer` of the
 * layouts that draw one.
 */
export interface PageFooter {
	/** Whether each sheet keeps an empty footer, `height` mm tall, at its bottom. */
	show: boolean
	/** The footer's height, in whole mm (`isFooterHeight`). */
	height: number
}

/** No footer, 20 mm tall once shown. */
export function footerDefaults(): PageFooter {
	return { show: false, height: 20 }
}

export const FOOTER_VALIDATORS: Validators<PageFooter> = {
	show: isBoolean,
	height: isFooterHeight,
}
