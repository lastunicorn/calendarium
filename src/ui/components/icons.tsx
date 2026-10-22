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

/** Arrow down into a tray: opens a project file. */
export function OpenIcon() {
	return (
		<Icon>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="M7 10l5 5 5-5" />
			<path d="M12 15V3" />
		</Icon>
	)
}

/** Arrow up out of a tray: saves the project to a file. */
export function SaveIcon() {
	return (
		<Icon>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="M17 8l-5-5-5 5" />
			<path d="M12 3v12" />
		</Icon>
	)
}

/**
 * A power symbol whose ring breaks into dashes on the upper right: restores default settings, of a section or a whole project.
 * Flat ends, so the narrow gaps between the dashes stay open.
 */
export function ResetIcon() {
	return (
		<Icon>
			<g strokeLinecap="butt">
				<path d="M12 2v9" />
				<path d="M20 13a8 8 0 1 1-12-6.93" />
				<path d="M16 6.07a8 8 0 0 1 1.95 1.58" />
				<path d="M18.93 9a8 8 0 0 1 .9 2.34" />
			</g>
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

/** A star: the events section. */
export function EventsIcon() {
	return (
		<Icon>
			<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
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

/** Dots in a frame, a page's days: the content section. */
export function ContentIcon() {
	return (
		<Icon>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			{[7.5, 10.5, 13.5, 16.5].map((cy) =>
				[8, 12, 16].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.75" />),
			)}
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

/** An "X": closes what it sits on without acting. */
export function CloseIcon() {
	return (
		<Icon>
			<path d="M18 6L6 18" />
			<path d="M6 6l12 12" />
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
