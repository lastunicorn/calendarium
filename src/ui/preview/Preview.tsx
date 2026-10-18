import type { ComponentType } from 'react'
import type { AppConfig, LayoutConfigs, LayoutId } from '../../config/CalendarConfig'
import { pageSizeCss } from '../../core/paper'
import { LAYOUTS } from '../layouts/registry'
import styles from './Preview.module.css'

interface PreviewProps {
	config: AppConfig
}

interface ActiveLayoutProps<K extends LayoutId> {
	layout: K
	config: LayoutConfigs[K]
}

/** Draws `layout` with its own options; generic so the component and its options stay paired. */
function ActiveLayout<K extends LayoutId>({ layout, config }: ActiveLayoutProps<K>) {
	const Layout: ComponentType<{ config: LayoutConfigs[K] }> = LAYOUTS[layout]
	return <Layout config={config} />
}

/** The scrollable area showing the chosen layout's pages, which is all that gets printed. */
export function Preview({ config }: PreviewProps) {
	const { layout } = config
	const options = config.layouts[layout]
	return (
		<main className={styles.preview}>
			{/* The printed paper size. Every page shares it, so one rule covers the document. */}
			<style>{`@page { size: ${pageSizeCss(options.page.paperSize, options.page.orientation)}; }`}</style>
			<ActiveLayout layout={layout} config={options} />
		</main>
	)
}
