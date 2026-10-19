import type { ConfigValidators } from '../validators'

/**
 * What the config layer knows about one layout, given its options type `C`: the values it starts
 * from, how untrusted data for it is checked, and the rules that tie its fields together.
 */
export interface LayoutSpec<C> {
	/** A fresh copy of the layout's default options, picked for how it is drawn. */
	defaults: () => C
	/** One validator per field except `page`, applied field by field when parsing. */
	validators: ConfigValidators<C>
	/**
	 * `config` with the rules that tie several fields together applied, which field validators
	 * can't check one by one; the same object when it already follows them. Every config in state
	 * passes through it (after parsing and after each reducer change), so the layouts can render it
	 * as is and the forms' limits are only a hint.
	 */
	normalize: (config: C) => C
}

/** A `normalize` for a layout without cross-field rules. */
export function unchanged<C>(config: C): C {
	return config
}
