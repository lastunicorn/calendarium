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

/** The options of an empty bordered footer at the bottom of every sheet, shared by the layouts that draw one. */
export interface PageFooter {
	/** Whether each sheet keeps an empty footer, `footerHeight` mm tall, at its bottom. */
	showFooter: boolean
	/** The footer's height, in whole mm (`isFooterHeight`). */
	footerHeight: number
}

/** No footer, 20 mm tall once shown. */
export function footerDefaults(): PageFooter {
	return { showFooter: false, footerHeight: 20 }
}

export const FOOTER_VALIDATORS: Validators<PageFooter, keyof PageFooter> = {
	showFooter: isBoolean,
	footerHeight: isFooterHeight,
}
