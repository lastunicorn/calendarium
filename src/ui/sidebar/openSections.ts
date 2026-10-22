import { createContext, useContext } from 'react'

/** Which sidebar section is open, by title, and a way to open or close one. */
export interface OpenSections {
	isOpen: (title: string) => boolean
	toggle: (title: string) => void
}

/**
 * Given by the `WorkspaceForm` to its `Section`s, from the viewer's preferences, so their state
 * outlives a layout's form.
 */
export const OpenSectionsContext = createContext<OpenSections | null>(null)

/** The `OpenSections` of the enclosing `WorkspaceForm`. */
export function useOpenSectionsContext(): OpenSections {
	const sections = useContext(OpenSectionsContext)
	if (sections === null) throw new Error('A Section must be inside a WorkspaceForm')
	return sections
}
