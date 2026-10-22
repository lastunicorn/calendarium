import { createContext, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'calendarium-open-sections'

/** Which sidebar section is open, by title, and a way to open or close one. */
export interface OpenSections {
	isOpen: (title: string) => boolean
	toggle: (title: string) => void
}

/** Given by the `WorkspaceForm` to its `Section`s, so their state outlives a layout's form. */
export const OpenSectionsContext = createContext<OpenSections | null>(null)

/** The `OpenSections` of the enclosing `WorkspaceForm`. */
export function useOpenSectionsContext(): OpenSections {
	const sections = useContext(OpenSectionsContext)
	if (sections === null) throw new Error('A Section must be inside a WorkspaceForm')
	return sections
}

/** The stored open title: a list of at most one, as earlier builds kept several. */
function loadTitle(): string | null {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
		const title: unknown = Array.isArray(stored) ? stored[0] : undefined
		return typeof title === 'string' ? title : null
	} catch {
		return null
	}
}

/**
 * The open sidebar section, none at first: opening one closes the one open before, so the sidebar
 * shows one group of fields at a time. Remembered by title in `localStorage` (a viewer
 * preference, not part of the workspace). Layouts share titles, so a section open on one
 * layout, like "Calendar", is open on the others too.
 */
export function useOpenSections(): OpenSections {
	const [openTitle, setOpenTitle] = useState(loadTitle)
	// Saved only after a change, so merely opening the app writes nothing.
	const saved = useRef(openTitle)

	useEffect(() => {
		if (openTitle === saved.current) return
		saved.current = openTitle
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(openTitle === null ? [] : [openTitle]))
		} catch {
			// Storage may be unavailable (private mode, quota); the section then closes on reload.
		}
	}, [openTitle])

	function isOpen(title: string) {
		return title === openTitle
	}

	function toggle(title: string) {
		setOpenTitle((current) => (current === title ? null : title))
	}

	return { isOpen, toggle }
}
