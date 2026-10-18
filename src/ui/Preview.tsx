import type { CalendarConfig } from '../config/CalendarConfig'
import { YearOnePageLayout } from './layouts/YearOnePageLayout'
import styles from './Preview.module.css'

interface PreviewProps {
	config: CalendarConfig
}

export function Preview({ config }: PreviewProps) {
	return (
		<main className={styles.preview}>
			<section className={`${styles.page} ${styles.a4Portrait}`}>
				<YearOnePageLayout config={config} />
			</section>
		</main>
	)
}
