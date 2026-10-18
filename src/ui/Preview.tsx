import type { CalendarConfig } from '../config/CalendarConfig'
import { YearOnePageLayout } from './layouts/YearOnePageLayout'
import styles from './Preview.module.css'

interface PreviewProps {
	config: CalendarConfig
}

const PAGE_CLASSES = {
	portrait: styles.a4Portrait,
	landscape: styles.a4Landscape,
}

export function Preview({ config }: PreviewProps) {
	return (
		<main className={styles.preview}>
			<section className={`${styles.page} ${PAGE_CLASSES[config.orientation]}`}>
				<YearOnePageLayout config={config} />
			</section>
		</main>
	)
}
