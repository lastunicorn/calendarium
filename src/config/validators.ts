import { isWeekStartSetting, LOCALES, WEEKDAY_FORMATS } from '../core/locale'
import { ORIENTATIONS, PAPER_SIZES } from '../core/paper'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'
import { type CommonConfig, isMargin, isYear, type Margins, type PageSetup } from './CalendarConfig'

export type Validator<T> = (value: unknown) => value is T

/**
 * How one field of type `T` is checked: a validator, or for a nested object a table of its own,
 * checking it field by field so one bad field keeps the others.
 */
// Wrapped in a tuple so a union like `boolean` isn't split into one check per member.
export type FieldCheck<T> = [T] extends [object] ? Validators<T> : Validator<T>

/** One check per listed field of `T`. As a mapped type, a missing one is a compile error. */
export type Validators<T, K extends keyof T = keyof T> = { [P in K]: FieldCheck<T[P]> }

/** The checks of every field of a layout's options, nested objects like `page` included. */
export type ConfigValidators<C> = Validators<C>

export function oneOf<T>(values: readonly T[]) {
	return (value: unknown): value is T => values.includes(value as T)
}

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean'
}

/** Margins are checked per side, so one bad side keeps the others. */
const MARGIN_VALIDATORS: Validators<Margins> = {
	top: isMargin,
	right: isMargin,
	bottom: isMargin,
	left: isMargin,
}

const PAGE_VALIDATORS: Validators<PageSetup> = {
	paperSize: oneOf(PAPER_SIZES),
	orientation: oneOf(ORIENTATIONS),
	mirrorMargins: isBoolean,
	margins: MARGIN_VALIDATORS,
}

/** The validators of the options every layout has; each layout's spec extends them. */
export const COMMON_VALIDATORS: ConfigValidators<CommonConfig> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStartSetting,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
	page: PAGE_VALIDATORS,
}
