import { isWeekStartSetting, LOCALES, WEEKDAY_FORMATS } from '../core/locale'
import { WEEKEND_HIGHLIGHTS } from '../core/weekend'
import { type CommonConfig, isYear } from './CalendarConfig'

export type Validator<T> = (value: unknown) => value is T

/** One validator per listed field of `T`. As a mapped type, a missing one is a compile error. */
export type Validators<T, K extends keyof T> = { [P in K]: Validator<T[P]> }

/** Validators for every field of a layout's options except `page`, which is checked on its own. */
export type ConfigValidators<C> = Validators<C, Exclude<keyof C, 'page'>>

export function oneOf<T>(values: readonly T[]) {
	return (value: unknown): value is T => values.includes(value as T)
}

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean'
}

/** The validators of the options every layout has; each layout's spec extends them. */
export const COMMON_VALIDATORS: ConfigValidators<CommonConfig> = {
	year: isYear,
	locale: oneOf(LOCALES),
	weekStart: isWeekStartSetting,
	weekdayFormat: oneOf(WEEKDAY_FORMATS),
	highlightWeekends: oneOf(WEEKEND_HIGHLIGHTS),
	showWeekNumbers: isBoolean,
}
