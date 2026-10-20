import type { AppConfig } from '../../config/AppConfig'
import type { LayoutConfigs, LayoutId } from '../../layouts'
import { pageSizeCss } from '../../core/paper'
import { layoutView } from '../layouts/registry'
import styles from './Preview.module.css'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

interface PreviewProps {
	config: AppConfig
	/** Restores one layout's default options, offered when its pages fail to render. */
	onResetLayout: (layout: LayoutId) => void
}

interface ActiveLayoutProps<K extends LayoutId> {
	layout: K
	config: LayoutConfigs[K]
}

/** Draws `layout` with its own options; generic so the component and its options stay paired. */
function ActiveLayout<K extends LayoutId>({ layout, config }: ActiveLayoutProps<K>) {
	const Layout = layoutView(layout).Component
	return <Layout config={config} />
}

/** The scrollable area showing the chosen layout's pages, which is all that gets printed. */
export function Preview({ config, onResetLayout }: PreviewProps) {
	const { layout } = config
	const options = config.layouts[layout]
	return (
		<main className={styles.preview}>
			{/* The printed paper size. Every page shares it, so one rule covers the document. */}
			<style>{`@page { size: ${pageSizeCss(options.page.paperSize, options.page.orientation)}; }`}</style>
			<PreviewErrorBoundary layout={layout} config={options} onReset={onResetLayout}>
				<ActiveLayout layout={layout} config={options} />
			</PreviewErrorBoundary>
		</main>
	)
}
