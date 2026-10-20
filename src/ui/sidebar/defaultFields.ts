/** The `fields` of `defaults`: a patch restoring those fields, e.g. a section's, to their defaults. */
export function defaultFields<C, K extends keyof C>(defaults: C, fields: readonly K[]): Pick<C, K> {
	const patch = {} as Pick<C, K>
	for (const field of fields) patch[field] = defaults[field]
	return patch
}
