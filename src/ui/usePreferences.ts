import { useEffect, useRef, useState } from 'react'
import { withSectionToggled } from '../preferences/Preferences'
import type { PreviewZoom } from '../preferences/zoom'
import { loadPreferences, savePreferences } from '../preferences/storage'

/** The viewer's preferences: loaded from and saved to `localStorage`, apart from the workspace. */
export function usePreferences() {
	const [preferences, setPreferences] = useState(loadPreferences)
	// Saved only after a change, so merely opening the app writes nothing.
	const saved = useRef(preferences)

	useEffect(() => {
		if (preferences === saved.current) return
		saved.current = preferences
		savePreferences(preferences)
	}, [preferences])

	function resizeSidebar(sidebarWidth: number) {
		setPreferences((current) => ({ ...current, sidebarWidth }))
	}

	function toggleSection(title: string) {
		setPreferences((current) => withSectionToggled(current, title))
	}

	function zoomPreview(previewZoom: PreviewZoom) {
		setPreferences((current) => ({ ...current, previewZoom }))
	}

	return { preferences, resizeSidebar, toggleSection, zoomPreview }
}
