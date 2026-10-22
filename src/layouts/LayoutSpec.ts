import type { Validators } from '../core/validation'

/**
 * What the domain knows about one layout's options, given their type `C`: the values they start
 * from, which values are legal, and the rules that tie fields together.
 */
export interface LayoutSpec<C> {
	/** A fresh copy of the layout's default options, picked for how it is drawn. */
	defaults: () => C
	/** One check per field, a nested table for an object like `page`, applied field by field when parsing. */
	validators: Validators<C>
	/**
	 * `config` with the rules that tie several fields together applied, which field validators
	 * can't check one by one; the same object when it already follows them. Every config in state
	 * passes through it (after parsing and after each reducer change), so the layouts can render it
	 * as is and the forms' limits are only a hint. Starts from `normalizeCommon`, the rules of
	 * the options every layout has.
	 */
	normalize: (config: C) => C
}
