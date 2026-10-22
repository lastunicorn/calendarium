// Checks of untrusted values. Each domain module declares the legal values of its types with
// these (`PAGE_VALIDATORS`, a layout's `LayoutSpec.validators`); `copyValid` applies them, to
// stored data and imported files.

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

/** Untrusted data, read from storage or a file, as an object whose fields can be read. */
export type UntrustedObject = Record<string, unknown>

/** `value` as an object whose fields can be read, or `null` when it is not a plain object. */
export function asObject(value: unknown): UntrustedObject | null {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as UntrustedObject)
		: null
}

/** A validator table seen field by field, whatever object it checks. */
type AnyValidators = { [field: string]: Validator<unknown> | AnyValidators }

/**
 * Copies each field of `source` that passes its check in `validators` onto `target`, which holds
 * a valid value of every field. A nested table checks an object field by field, copying onto the
 * object `target` already holds there. A field that is present but invalid, or a nested object
 * that is not an object, is added to `ignored` as its path: `prefix` + its name
 * (`page.margins.top`). Fields without a check are left out silently.
 */
export function copyValid<T extends object>(
	target: T,
	source: UntrustedObject,
	validators: Validators<T>,
	ignored: string[],
	prefix = '',
) {
	const fields = target as UntrustedObject
	for (const [key, check] of Object.entries(validators as AnyValidators)) {
		const value = source[key]
		const path = prefix + key
		if (typeof check === 'function') {
			if (check(value)) fields[key] = value
			else if (value !== undefined) ignored.push(path)
			continue
		}
		if (value === undefined) continue
		const nested = asObject(value)
		if (nested === null) ignored.push(path)
		else
			copyValid(
				fields[key] as object,
				nested,
				check as Validators<object>,
				ignored,
				`${path}.`,
			)
	}
}
