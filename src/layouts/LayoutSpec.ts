import { asObject, copyValid, type UntrustedObject, type Validators } from '../core/validation'

/**
 * One step that brings a layout's stored options from one config version to the next. Values are
 * moved as they are; parsing checks them afterwards. The options may carry other fields (a file's
 * tags), which a step keeps.
 */
export type OptionsMigration = (options: UntrustedObject) => UntrustedObject

/**
 * A layout's migration steps, keyed by the config version each starts from; a version in which
 * the layout's options did not change has none. `config/migrations.ts` applies them, in storage
 * and in files.
 */
export type LayoutMigrations = Readonly<Partial<Record<number, OptionsMigration>>>

/**
 * What the domain knows about one layout's options, given their type `C`: the values they start
 * from, which values are legal, the rules that tie fields together, and how older stored options
 * are brought to the current shape.
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
	/** The steps that changed the layout's own options between config versions. */
	migrations: LayoutMigrations
}

/**
 * Keeps only the valid fields of untrusted options in the current shape, falling back to the
 * spec's defaults, then applies its cross-field rules. Fields that were present but invalid are
 * added to `ignored` as their paths (`firstHour`, `page.margins.top`).
 */
export function parseOptions<C extends object>(
	spec: LayoutSpec<C>,
	data: unknown,
	ignored: string[] = [],
): C {
	const config = spec.defaults()
	const stored = asObject(data)
	if (stored === null) return config
	copyValid(config, stored, spec.validators, ignored)
	return spec.normalize(config)
}
