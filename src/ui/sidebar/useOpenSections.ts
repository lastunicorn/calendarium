import { createContext, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'calendarium-open-sections'

/** Which sidebar sections are open, by title, and a way to open or close one. */
export interface OpenSections {
	isOpen: (title: string) => boolean
	toggle: (title: string) => void
}

/** Given by the `ConfigForm` to its `Section`s, so their state outlives a layout's form. */
export const OpenSectionsContext = createContext<OpenSections | null>(null)

/** The `OpenSections` of the enclosing `ConfigForm`. */
export function useOpenSectionsContext(): OpenSections {
	const sections = useContext(OpenSectionsContext)
	if (sections === null) throw new Error('A Section must be inside a ConfigForm')
	return sections
}

function loadTitles(): ReadonlySet<string> {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
		return new Set(
			Array.isArray(stored) ? stored.filter((title) => typeof title === 'string') : [],
		)
	} catch {
		return new Set()
	}
}

/**
 * The open sidebar sections, all closed at first, remembered by title in `localStorage` (a viewer
 * preference, not part of the calendar config). Layouts share titles, so a section open on one
 * layout, like "Calendar", is open on the others too.
 */
export function useOpenSections(): OpenSections {
	const [titles, setTitles] = useState(loadTitles)
	// Saved only after a change, so merely opening the app writes nothing.
	const saved = useRef(titles)

	useEffect(() => {
		if (titles === saved.current) return
		saved.current = titles
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify([...titles]))
		} catch {
			// Storage may be unavailable (private mode, quota); the sections then close on reload.
		}
	}, [titles])

	function isOpen(title: string) {
		return titles.has(title)
	}

	function toggle(title: string) {
		setTitles((current) => {
			const next = new Set(current)
			if (!next.delete(title)) next.add(title)
			return next
		})
	}

	return { isOpen, toggle }
}
