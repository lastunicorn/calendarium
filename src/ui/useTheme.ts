import { useLayoutEffect } from 'react'

import type { Theme } from '../preferences/Preferences'

/**
 * Applies the viewer's theme to the document: `data-theme` on `<html>` for a theme they chose, none
 * to follow their system's (`index.css`). Before the first paint, so a chosen theme doesn't flash
 * the system's.
 */
export function useTheme(theme: Theme) {
	useLayoutEffect(() => {
		const root = document.documentElement
		if (theme === 'system') delete root.dataset.theme
		else root.dataset.theme = theme
	}, [theme])
}
