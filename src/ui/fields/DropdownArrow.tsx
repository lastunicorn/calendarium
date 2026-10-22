import dropdown from './Dropdown.module.css'

/** The arrow at the right end of a dropdown, placed right after its control (`dropdown.control`). */
export function DropdownArrow() {
	return (
		<svg className={dropdown.arrow} viewBox="0 0 16 16" aria-hidden="true">
			<path d="M4 6l4 4 4-4" />
		</svg>
	)
}
