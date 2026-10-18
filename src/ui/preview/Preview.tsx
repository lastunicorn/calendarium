import type { CalendarConfig } from '../../config/CalendarConfig'
import { pageSizeCss } from '../../core/paper'
import { YearOnePageLayout } from '../layouts/YearOnePageLayout'
import { Page } from './Page'
import styles from './Preview.module.css'

interface PreviewProps {
	config: CalendarConfig
}

export function Preview({ config }: PreviewProps) {
	const { paperSize, orientation, margins } = config
	return (
		<main className={styles.preview}>
			{/* The printed paper size. Every page shares it, so one rule covers the document. */}
			<style>{`@page { size: ${pageSizeCss(paperSize, orientation)}; }`}</style>
			<Page paperSize={paperSize} orientation={orientation} margins={margins}>
				<YearOnePageLayout config={config} />
			</Page>
		</main>
	)
}
