import { type CSSProperties, useLayoutEffect, useRef } from 'react'
import type { Workspace } from '../../workspace/Workspace'
import type { LayoutOptions, LayoutId } from '../../layouts'
import { pageSizeCss, sheetDimensions } from '../../core/paper'
import { type PreviewZoom, zoomScale } from '../../preferences/zoom'
import { layoutView } from '../layouts/registry'
import styles from './Preview.module.css'
import { PreviewErrorBoundary } from './PreviewErrorBoundary'
import { Booklet } from './Booklet'
import { Spreads } from './Spreads'
import { useScrollAreaSize } from './useScrollAreaSize'
import { useCurrentPage } from './useCurrentPage'
import { PageIndicator } from './PageIndicator'
import { ZoomBar } from './ZoomBar'
import { type ScreenPoint, useZoomGestures } from './useZoomGestures'

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

type AreaStyle = CSSProperties & Record<'--scrollbar-width' | '--scrollbar-height', string>
type PagesStyle = CSSProperties & Record<'--preview-zoom', number>

/** A point on screen kept in place by a zoom, and where it falls on the pages, as a fraction. */
interface ZoomAnchor {
	point: ScreenPoint
	x: number
	y: number
}

/** The middle of `area`'s visible part, on screen. */
function areaMiddle(area: HTMLElement): ScreenPoint {
	const rect = area.getBoundingClientRect()
	return { x: rect.left + area.clientWidth / 2, y: rect.top + area.clientHeight / 2 }
}

/** Whether `layout` reads its pages as facing pairs with `options`, shown as spreads outside a booklet. */
function showsSpreads<K extends LayoutId>(layout: K, options: LayoutOptions[K]): boolean {
	return !options.page.booklet && (layoutView(layout).facingPages?.(options) ?? false)
}

/** Draws `layout` with its own options; generic so the component and its options stay paired. */
function ActiveLayout<K extends LayoutId>({ layout, options }: ActiveLayoutProps<K>) {
	const Layout = layoutView(layout).Component
	return <Layout options={options} />
}

/**
 * The scrollable area showing the chosen layout's pages, which is all that gets printed, at the
 * viewer's zoom, with the zoom bar and the page indicator over it. Zooming keeps the middle of
 * the view in place, or with the wheel the point under the pointer. The preview takes the focus, so
 * its zoom shortcuts work once it is clicked.
 */
export function Preview({ workspace, onNewProject, zoom, onZoom }: PreviewProps) {
	const { layout } = workspace
	const options = workspace.layouts[layout]
	const previewRef = useRef<HTMLDivElement>(null)
	const areaRef = useRef<HTMLElement>(null)
	const pagesRef = useRef<HTMLDivElement>(null)
	const anchor = useRef<ZoomAnchor | null>(null)
	const { scrollbarWidth, scrollbarHeight, ...room } = useScrollAreaSize(areaRef)
	const { count, current, goToPage } = useCurrentPage(areaRef, pagesRef)
	const spreads = showsSpreads(layout, options)
	// What a fit fits: a sheet, or a spread of two pages.
	const sheet = sheetDimensions(options.page)
	const across = spreads && options.page.spine === 'left' ? 2 : 1
	const down = spreads && options.page.spine === 'top' ? 2 : 1
	const scale = zoomScale(
		zoom,
		{ width: across * sheet.width * PX_PER_MM, height: down * sheet.height * PX_PER_MM },
		room,
	)

	// Scrolls the point of the pages that was at the anchor before the zoom back there.
	useLayoutEffect(() => {
		const area = areaRef.current
		const pages = pagesRef.current
		if (anchor.current === null || area === null || pages === null) return
		const { point, x, y } = anchor.current
		const rect = pages.getBoundingClientRect()
		area.scrollLeft += rect.left + x * rect.width - point.x
		area.scrollTop += rect.top + y * rect.height - point.y
		anchor.current = null
	}, [zoom, scale])

	/** Zooms to `next`, keeping `point` (the middle of the view by default) in place. */
	function handleZoom(next: PreviewZoom, point?: ScreenPoint) {
		if (next === zoom) return
		const area = areaRef.current
		const pages = pagesRef.current
		if (area !== null && pages !== null) {
			const rect = pages.getBoundingClientRect()
			const at = point ?? areaMiddle(area)
			anchor.current = {
				point: at,
				x: (at.x - rect.left) / rect.width,
				y: (at.y - rect.top) / rect.height,
			}
		}
		onZoom(next)
	}

	useZoomGestures(previewRef, scale, handleZoom)

	const layoutPages = <ActiveLayout layout={layout} options={options} />
	const pages = spreads ? (
		<Spreads spine={options.page.spine}>{layoutPages}</Spreads>
	) : (
		layoutPages
	)
	return (
		<div
			ref={previewRef}
			className={styles.previewArea}
			style={
				{
					'--scrollbar-width': `${scrollbarWidth}px`,
					'--scrollbar-height': `${scrollbarHeight}px`,
				} as AreaStyle
			}
		>
			{/* In the calendar's language, so the browser writes it as such: Greek capitals without
			 accents, Chinese and Japanese characters in their own glyphs. */}
			<main
				ref={areaRef}
				className={styles.preview}
				lang={options.locale}
				tabIndex={0}
				aria-label="Preview"
			>
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
			<PageIndicator
				current={current}
				count={count}
				booklet={options.page.booklet}
				onGoToPage={goToPage}
			/>
		</div>
	)
}
