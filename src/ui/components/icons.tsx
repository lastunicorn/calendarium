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

/** Four tiles: the layout section. */
export function LayoutIcon() {
	return (
		<Icon>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</Icon>
	)
}

/** A calendar sheet with rings: the calendar section. */
export function CalendarIcon() {
	return (
		<Icon>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4" />
			<path d="M8 2v4" />
			<path d="M3 10h18" />
		</Icon>
	)
}

/** A capital T: the header text section. */
export function HeaderIcon() {
	return (
		<Icon>
			<path d="M4 7V4h16v3" />
			<path d="M12 4v16" />
			<path d="M9 20h6" />
		</Icon>
	)
}

/** A painter's palette: the appearance section. */
export function AppearanceIcon() {
	return (
		<Icon>
			<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-4 3.5h-1.5a1.5 1.5 0 0 0-1 2.6c.6.6.4 2.9-2.5 2.9z" />
			<circle cx="7.5" cy="11" r="1" />
			<circle cx="10.5" cy="7" r="1" />
			<circle cx="15" cy="7.5" r="1" />
		</Icon>
	)
}

/** A sheet of paper with a folded corner: the page section. */
export function PageIcon() {
	return (
		<Icon>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<path d="M14 2v6h6" />
		</Icon>
	)
}

/** A clock face: the day page section, with its hourly schedule. */
export function DayPageIcon() {
	return (
		<Icon>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</Icon>
	)
}

/** An "i" in a circle: opens a note about a field. */
export function InfoIcon() {
	return (
		<Icon>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</Icon>
	)
}

/** A chevron pointing right; turned down when the section it toggles is open. */
export function ChevronIcon() {
	return (
		<Icon>
			<path d="M9 6l6 6-6 6" />
		</Icon>
	)
}
