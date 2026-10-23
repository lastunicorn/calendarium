import type { ChangeEvent } from 'react'
import {
	DEFAULT_ZOOM,
	PREVIEW_ZOOMS,
	type PreviewZoom,
	type ZoomFit,
	zoomedIn,
	zoomedOut,
} from '../../preferences/zoom'
import { IconButton } from '../components/IconButton'
import { ResetIcon, ZoomInIcon, ZoomOutIcon } from '../components/icons'
import dropdown from '../fields/Dropdown.module.css'
import { DropdownArrow } from '../fields/DropdownArrow'
import floating from './FloatingBar.module.css'
import styles from './ZoomBar.module.css'

const ZOOM_FIT_LABELS: Record<ZoomFit, string> = {
	'fit-width': 'Fit width',
	'fit-page': 'Fit page',
}

interface ZoomBarProps {
	zoom: PreviewZoom
	/** The factor the pages are drawn at, `zoom` resolved for a fit. */
	scale: number
	onZoom: (zoom: PreviewZoom) => void
}

/** A zoom's menu label; a fit's names the level it comes to while chosen. */
function zoomLabel(zoom: PreviewZoom, chosen: PreviewZoom, scale: number): string {
	if (typeof zoom === 'number') return `${zoom}%`
	const label = ZOOM_FIT_LABELS[zoom]
	return zoom === chosen ? `${label} (${Math.round(scale * 100)}%)` : label
}

/**
 * The preview's zoom controls: a level down, the menu of levels and fits, a level up, and back to
 * the printed size. Stepping from a fit goes to the level either side of where it came to.
 */
export function ZoomBar({ zoom, scale, onZoom }: ZoomBarProps) {
	const levelIn = zoomedIn(scale)
	const levelOut = zoomedOut(scale)

	function handleZoomOutClick() {
		if (levelOut !== null) onZoom(levelOut)
	}

	function handleZoomInClick() {
		if (levelIn !== null) onZoom(levelIn)
	}

	function handleZoomSelectChange(event: ChangeEvent<HTMLSelectElement>) {
		// The <option>s are rendered from `PREVIEW_ZOOMS` in order, so the index maps back to a zoom.
		onZoom(PREVIEW_ZOOMS[event.currentTarget.selectedIndex])
	}

	function handleResetClick() {
		onZoom(DEFAULT_ZOOM)
	}

	return (
		<div
			className={`${floating.floatingBar} ${styles.zoomBar}`}
			role="toolbar"
			aria-label="Zoom"
		>
			<IconButton
				label="Zoom out"
				icon={<ZoomOutIcon />}
				disabled={levelOut === null}
				onClick={handleZoomOutClick}
			/>
			<div className={dropdown.box}>
				<select
					className={`${dropdown.control} ${styles.level}`}
					aria-label="Zoom level"
					value={String(zoom)}
					onChange={handleZoomSelectChange}
				>
					{PREVIEW_ZOOMS.map((option) => (
						<option key={option} value={String(option)}>
							{zoomLabel(option, zoom, scale)}
						</option>
					))}
				</select>
				<DropdownArrow />
			</div>
			<IconButton
				label="Zoom in"
				icon={<ZoomInIcon />}
				disabled={levelIn === null}
				onClick={handleZoomInClick}
			/>
			<IconButton
				label="Reset zoom to the printed size"
				icon={<ResetIcon />}
				disabled={zoom === DEFAULT_ZOOM}
				onClick={handleResetClick}
			/>
		</div>
	)
}
