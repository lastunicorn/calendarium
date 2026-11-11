import { IconButton } from '../components/IconButton'
import { PrintIcon } from '../components/icons'
import styles from './Toolbar.module.css'

function handlePrintClick() {
	window.print()
}

interface ToolbarProps {
	/** Whether there is nothing to print: no project is open. */
	disabled?: boolean
}

/** The actions on the whole calendar: print. */
export function Toolbar({ disabled = false }: ToolbarProps) {
	return (
		<div className={styles.toolbar} role="toolbar" aria-label="Calendar actions">
			<IconButton
				label="Print"
				icon={<PrintIcon />}
				disabled={disabled}
				onClick={handlePrintClick}
			/>
		</div>
	)
}
