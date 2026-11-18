import type { ReactNode } from 'react'

import { nextTheme, type Theme } from '../../preferences/Preferences'
import { IconButton } from '../components/IconButton'
import { DarkThemeIcon, LightThemeIcon, SystemThemeIcon } from '../components/icons'

/** Each theme's name and icon. */
const THEME_VIEWS: Record<Theme, { name: string; icon: ReactNode }> = {
	system: { name: 'System', icon: <SystemThemeIcon /> },
	light: { name: 'Light', icon: <LightThemeIcon /> },
	dark: { name: 'Dark', icon: <DarkThemeIcon /> },
}

interface ThemeButtonProps {
	theme: Theme
	onChange: (theme: Theme) => void
}

/** Shows the app's theme and steps to the next one: System, Light, Dark. */
export function ThemeButton({ theme, onChange }: ThemeButtonProps) {
	const { name, icon } = THEME_VIEWS[theme]

	function handleThemeClick() {
		onChange(nextTheme(theme))
	}

	return (
		<IconButton
			label={`Theme: ${name} (switch to ${THEME_VIEWS[nextTheme(theme)].name})`}
			icon={icon}
			onClick={handleThemeClick}
		/>
	)
}
