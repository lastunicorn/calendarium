import type { ReactNode } from 'react'

/** Shared 24×24 stroke icon frame; decorative, so hidden from assistive tech. */
function Icon({ children }: { children: ReactNode }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{children}
		</svg>
	)
}

export function PrintIcon() {
	return (
		<Icon>
			<path d="M6 9V3h12v6" />
			<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
			<rect x="6" y="14" width="12" height="7" />
		</Icon>
	)
}

/** Arrow up out of a tray: loads the config from a file. */
export function ImportIcon() {
	return (
		<Icon>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="M7 10l5 5 5-5" />
			<path d="M12 15V3" />
		</Icon>
	)
}

/** Arrow down into a tray: saves the config to a file. */
export function ExportIcon() {
	return (
		<Icon>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="M17 8l-5-5-5 5" />
			<path d="M12 3v12" />
		</Icon>
	)
}

/** Counter-clockwise arrow: restores the default config. */
export function ResetIcon() {
	return (
		<Icon>
			<path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
			<path d="M3 3v5h5" />
		</Icon>
	)
}
