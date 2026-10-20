import { IconButton } from '../components/IconButton'
import { PrintIcon } from '../components/icons'
import styles from './Toolbar.module.css'

function handlePrintClick() {
	window.print()
}

/** The actions on the whole calendar: print. */
export function Toolbar() {
	return (
		<div className={styles.toolbar} role="toolbar" aria-label="Calendar actions">
			<IconButton label="Print" icon={<PrintIcon />} onClick={handlePrintClick} />
		</div>
	)
}
