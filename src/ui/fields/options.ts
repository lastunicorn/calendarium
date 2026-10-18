export interface Option<T> {
	value: T
	label: string
}

/**
 * Options for every allowed value, in the order of `values`. `labels` must name each one, so a
 * new value without a label is a compile error.
 */
export function optionsFrom<T extends string | number>(
	values: readonly T[],
	labels: Record<T, string>,
): Option<T>[] {
	return values.map((value) => ({ value, label: labels[value] }))
}
