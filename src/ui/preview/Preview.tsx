import type { CalendarConfig } from '../../config/CalendarConfig'
import { pageSizeCss } from '../../core/paper'
import { LAYOUTS } from '../layouts/registry'
import styles from './Preview.module.css'

interface PreviewProps {
	config: CalendarConfig
}

/** The scrollable area showing the chosen layout's pages, which is all that gets printed. */
export function Preview({ config }: PreviewProps) {
	const Layout = LAYOUTS[config.layout]
	return (
		<main className={styles.preview}>
			{/* The printed paper size. Every page shares it, so one rule covers the document. */}
			<style>{`@page { size: ${pageSizeCss(config.page.paperSize, config.page.orientation)}; }`}</style>
			<Layout config={config} />
		</main>
	)
}
