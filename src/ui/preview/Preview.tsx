import { type CSSProperties, useLayoutEffect, useRef } from 'react'
import type { Workspace } from '../../workspace/Workspace'
import type { LayoutOptions, LayoutId } from '../../layouts'
import { pageSizeCss, sheetDimensions } from '../../core/paper'
import { type PreviewZoom, zoomScale } from '../../preferences/zoom'
import { layoutView } from '../layouts/registry'
import styles from './Preview.module.css'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'
import { Booklet } from './Booklet'
import { useScrollAreaSize } from './useScrollAreaSize'
import { ZoomBar } from './ZoomBar'

/** CSS px in a mm, the unit the pages are sized in. */
const PX_PER_MM = 96 / 25.4

interface PreviewProps {
	workspace: Workspace
	/** Starts one layout's project over from its defaults, offered when its pages fail to render. */
	onNewProject: (layout: LayoutId) => void
	/** How large the pages are drawn on screen, from the viewer's preferences. */
	zoom: PreviewZoom
	onZoom: (zoom: PreviewZoom) => void
}

interface ActiveLayoutProps<K extends LayoutId> {
	layout: K
	options: LayoutOptions[K]
}

type AreaStyle = CSSProperties & Record<'--scrollbar-width', string>
type PagesStyle = CSSProperties & Record<'--preview-zoom', number>

/** Where the middle of the preview falls on the pages, as a fraction of their width and height. */
interface ZoomAnchor {
	x: number
	y: number
}

/** The middle of `area`'s visible part, on screen. */
function areaMiddle(area: HTMLElement) {
	const rect = area.getBoundingClientRect()
	return { x: rect.left + area.clientWidth / 2, y: rect.top + area.clientHeight / 2 }
}

/** Draws `layout` with its own options; generic so the component and its options stay paired. */
function ActiveLayout<K extends LayoutId>({ layout, options }: ActiveLayoutProps<K>) {
	const Layout = layoutView(layout).Component
	return <Layout options={options} />
}

/**
 * The scrollable area showing the chosen layout's pages, which is all that gets printed, at the
 * viewer's zoom, with the zoom bar over it. Zooming from the bar keeps the middle of the view in
 * place.
 */
export function Preview({ workspace, onNewProject, zoom, onZoom }: PreviewProps) {
	const { layout } = workspace
	const options = workspace.layouts[layout]
	const areaRef = useRef<HTMLElement>(null)
	const pagesRef = useRef<HTMLDivElement>(null)
	const anchor = useRef<ZoomAnchor | null>(null)
	const { scrollbarWidth, ...room } = useScrollAreaSize(areaRef)
	const sheet = sheetDimensions(options.page)
	const scale = zoomScale(
		zoom,
		{ width: sheet.width * PX_PER_MM, height: sheet.height * PX_PER_MM },
		room,
	)

	// Scrolls the point that was in the middle before the zoom back there.
	useLayoutEffect(() => {
		const area = areaRef.current
		const pages = pagesRef.current
		if (anchor.current === null || area === null || pages === null) return
		const rect = pages.getBoundingClientRect()
		const middle = areaMiddle(area)
		area.scrollLeft += rect.left + anchor.current.x * rect.width - middle.x
		area.scrollTop += rect.top + anchor.current.y * rect.height - middle.y
		anchor.current = null
	}, [scale])

	function handleZoom(next: PreviewZoom) {
		const area = areaRef.current
		const pages = pagesRef.current
		if (area !== null && pages !== null) {
			const rect = pages.getBoundingClientRect()
			const middle = areaMiddle(area)
			anchor.current = {
				x: (middle.x - rect.left) / rect.width,
				y: (middle.y - rect.top) / rect.height,
			}
		}
		onZoom(next)
	}

	const pages = <ActiveLayout layout={layout} options={options} />
	return (
		<div
			className={styles.previewArea}
			style={{ '--scrollbar-width': `${scrollbarWidth}px` } as AreaStyle}
		>
			{/* In the calendar's language, so the browser writes it as such: Greek capitals without
			 accents, Chinese and Japanese characters in their own glyphs. */}
			<main ref={areaRef} className={styles.preview} lang={options.locale}>
				{/* The printed paper size. Every sheet shares it, so one rule covers the document. */}
				<style>{`@page { size: ${pageSizeCss(options.page)}; }`}</style>
				<div
					ref={pagesRef}
					className={styles.pages}
					style={{ '--preview-zoom': scale } as PagesStyle}
				>
					<PreviewErrorBoundary
						layout={layout}
						options={options}
						onNewProject={onNewProject}
					>
						{options.page.booklet ? (
							<Booklet setup={options.page}>{pages}</Booklet>
						) : (
							pages
						)}
					</PreviewErrorBoundary>
				</div>
			</main>
			<ZoomBar zoom={zoom} scale={scale} onZoom={handleZoom} />
		</div>
	)
}
