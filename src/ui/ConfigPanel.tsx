import styles from './ConfigPanel.module.css'

function handlePrintClick() {
	window.print()
}

export function ConfigPanel() {
	return (
		<aside className={styles.panel}>
			<h1>Calendar</h1>
			<p>Configuration options will appear here.</p>
			<button type="button" onClick={handlePrintClick}>
				Print
			</button>
		</aside>
	)
}
