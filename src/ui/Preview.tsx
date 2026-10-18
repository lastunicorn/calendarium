import styles from './Preview.module.css'

export function Preview() {
	return (
		<main className={styles.preview}>
			<section className={`${styles.page} ${styles.a4Portrait}`}>
				<p>Calendar page preview</p>
			</section>
		</main>
	)
}
