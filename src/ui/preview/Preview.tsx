import type { Workspace } from '../../workspace/Workspace'
import type { LayoutOptions, LayoutId } from '../../layouts'
import { pageSizeCss } from '../../core/paper'
import { layoutView } from '../layouts/registry'
import styles from './Preview.module.css'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'

interface PreviewProps {
	workspace: Workspace
	/** Restores one layout's default options, offered when its pages fail to render. */
	onResetLayout: (layout: LayoutId) => void
}

interface ActiveLayoutProps<K extends LayoutId> {
	layout: K
	options: LayoutOptions[K]
}

/** Draws `layout` with its own options; generic so the component and its options stay paired. */
function ActiveLayout<K extends LayoutId>({ layout, options }: ActiveLayoutProps<K>) {
	const Layout = layoutView(layout).Component
	return <Layout options={options} />
}

/** The scrollable area showing the chosen layout's pages, which is all that gets printed. */
export function Preview({ workspace, onResetLayout }: PreviewProps) {
	const { layout } = workspace
	const options = workspace.layouts[layout]
	return (
		<main className={styles.preview}>
			{/* The printed paper size. Every page shares it, so one rule covers the document. */}
			<style>{`@page { size: ${pageSizeCss(options.page.paperSize, options.page.orientation)}; }`}</style>
			<PreviewErrorBoundary layout={layout} options={options} onReset={onResetLayout}>
				<ActiveLayout layout={layout} options={options} />
			</PreviewErrorBoundary>
		</main>
	)
}
