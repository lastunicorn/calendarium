import type { CalendarConfig } from '../config/CalendarConfig'
import { YearOnePageLayout } from './layouts/YearOnePageLayout'
import styles from './Preview.module.css'

interface PreviewProps {
	config: CalendarConfig
}

const PAGE_CLASSES = {
	a4: { portrait: styles.a4Portrait, landscape: styles.a4Landscape },
	a3: { portrait: styles.a3Portrait, landscape: styles.a3Landscape },
	letter: { portrait: styles.letterPortrait, landscape: styles.letterLandscape },
}

export function Preview({ config }: PreviewProps) {
	const { top, right, bottom, left } = config.margins
	return (
		<main className={styles.preview}>
			<section
				className={`${styles.page} ${PAGE_CLASSES[config.paperSize][config.orientation]}`}
				style={{ padding: `${top}mm ${right}mm ${bottom}mm ${left}mm` }}
			>
				<YearOnePageLayout config={config} />
			</section>
		</main>
	)
}
