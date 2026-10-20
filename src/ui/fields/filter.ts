import type { Option } from './options'

/** An option a filter can find by its label or by other words, like a language's native name. */
export interface FilterOption<T> extends Option<T> {
	keywords?: readonly string[]
}

/** Text lowercased and stripped of accents, so "romana" finds "Română". */
function fold(text: string): string {
	return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Everything a filter matches an option on, folded once. */
export function searchText(option: FilterOption<unknown>): string {
	return fold([option.label, ...(option.keywords ?? [])].join(' '))
}

/** Whether every word of `query` appears somewhere in `text` (from `searchText`). */
export function matchesFilter(text: string, query: string): boolean {
	return fold(query)
		.split(/\s+/)
		.every((word) => text.includes(word))
}
