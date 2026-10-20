// Checks of untrusted values. Each domain module declares the legal values of its types with
// these (`PAGE_VALIDATORS`, a layout's `LayoutSpec.validators`); `config/parseConfig` applies them
// to stored data and imported files.

export type Validator<T> = (value: unknown) => value is T

/**
 * How one field of type `T` is checked: a validator, or for a nested object a table of its own,
 * checking it field by field so one bad field keeps the others.
 */
// Wrapped in a tuple so a union like `boolean` isn't split into one check per member.
export type FieldCheck<T> = [T] extends [object] ? Validators<T> : Validator<T>

/** One check per listed field of `T`. As a mapped type, a missing one is a compile error. */
export type Validators<T, K extends keyof T = keyof T> = { [P in K]: FieldCheck<T[P]> }

export function oneOf<T>(values: readonly T[]) {
	return (value: unknown): value is T => values.includes(value as T)
}

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean'
}
