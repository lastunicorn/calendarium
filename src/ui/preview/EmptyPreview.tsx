import styles from './EmptyPreview.module.css'

interface EmptyPreviewProps {
	/** Asks for a new project's name and layout. */
	onNewProject: () => void
}

/** What the preview shows without a project: a short note and a way to start one. */
export function EmptyPreview({ onNewProject }: EmptyPreviewProps) {
	return (
		<main className={styles.empty} aria-label="Preview">
			<p className={styles.message}>No project is open.</p>
			<button type="button" className={styles.button} onClick={onNewProject}>
				New project…
			</button>
		</main>
	)
}
