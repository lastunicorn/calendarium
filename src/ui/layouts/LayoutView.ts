import type { ComponentType } from 'react'
import type { ConfigSectionProps } from '../sidebar/Section'

/** What the UI knows about one layout, given its options type `C`. */
export interface LayoutView<C> {
	/**
	 * Draws the layout from its options. It renders its own `Page`s, so it decides how many pages
	 * there are.
	 */
	Component: ComponentType<{ config: C }>
	/** The layout's options form: the sections for the options it has. */
	Form: ComponentType<ConfigSectionProps<C>>
	/** A short name, for messages like "Reset Month settings". */
	name: string
	/** The name with a short description, for the layout picker. */
	label: string
}
