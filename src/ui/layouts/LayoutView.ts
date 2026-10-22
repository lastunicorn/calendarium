import type { ComponentType } from 'react'
import type { OptionsSectionProps } from '../sidebar/Section'

/** What the UI knows about one layout, given its options type `O`. */
export interface LayoutView<O> {
	/**
	 * Draws the layout from its options. It renders its own `Page`s, so it decides how many pages
	 * there are.
	 */
	Component: ComponentType<{ options: O }>
	/** The layout's options form: the sections for the options it has. */
	Form: ComponentType<OptionsSectionProps<O>>
	/** A short name, for messages like "Reset Month settings". */
	name: string
	/** The name with a short description, for the layout picker. */
	label: string
}
