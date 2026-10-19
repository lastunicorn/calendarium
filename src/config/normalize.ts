import type { DayPerPageConfig, LayoutConfigs, LayoutId } from './CalendarConfig'

// Rules that tie several fields together, which field validators can't check one by one. Every
// config in state passes through here (after parsing and after each reducer change), so the
// layouts can render it as is and the forms' limits are only a hint.

type Normalizer<C> = (config: C) => C

/** The schedule runs from `firstHour` to `lastHour`: a reversed range is put in order. */
function normalizeDayPerPage(config: DayPerPageConfig): DayPerPageConfig {
	const { firstHour, lastHour } = config
	return firstHour <= lastHour ? config : { ...config, firstHour: lastHour, lastHour: firstHour }
}

function unchanged<C>(config: C): C {
	return config
}

/** Each layout's cross-field rules. As a mapped type, a missing layout is a compile error. */
const NORMALIZERS: { [K in LayoutId]: Normalizer<LayoutConfigs[K]> } = {
	'year-per-page': unchanged,
	'month-per-page': unchanged,
	'day-per-page': normalizeDayPerPage,
}

/** `config` with its layout's rules applied; the same object when it already follows them. */
export function normalizeLayout<K extends LayoutId>(
	layout: K,
	config: LayoutConfigs[K],
): LayoutConfigs[K] {
	// Indexing with a generic key gives a union of normalizers; the mapped type above ties each
	// one to its layout's config, so the cast is safe.
	const normalize = NORMALIZERS[layout] as Normalizer<LayoutConfigs[K]>
	return normalize(config)
}
