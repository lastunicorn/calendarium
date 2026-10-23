import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import type { PageSetup } from '../../core/paper'
import { BINDING_WIDTH, ringCount, spreadCount, spreadOf } from './spreadLayout'
import styles from './Spreads.module.css'

interface SpreadsProps {
	/** The pages' setup: its spine says where they are bound, side by side or one above the other. */
	setup: PageSetup
	/** The layout's pages, in reading order. */
	children: ReactNode
}

type SpreadsStyle = CSSProperties & Record<'--binding-width', string>

/**
 * Puts `page` on the grid: side by side, a spread is a row of a page, the binding and a page; one
 * above the other, three rows. The first page of every spread but the first is set apart from the
 * spread before.
 */
function placePage(page: HTMLElement, index: number, sideBySide: boolean) {
	const { spread, side } = spreadOf(index)
	page.style.gridRow = String(sideBySide ? spread + 1 : 3 * spread + 2 * side + 1)
	page.style.gridColumn = String(sideBySide ? 2 * side + 1 : 1)
	page.toggleAttribute('data-spread-start', spread > 0 && side === 0)
}

/**
 * The layout's pages on screen as the bound calendar shows them open: the first page alone, on the
 * right of the spine (or below it), then every even page facing the odd one after it, a ring
 * binding between them so they read as separate sheets, unlike a booklet's. Only the preview's
 * arrangement: the pages stay in reading order in the document, each printing on its own sheet,
 * and the bindings, after them, are not printed; the grid places them all, from the pages drawn.
 */
export function Spreads({ setup, children }: SpreadsProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [pageCount, setPageCount] = useState(0)
	const sideBySide = setup.spine === 'left'

	// The layout's pages may change with any new children: their count first, then their places.
	useLayoutEffect(() => {
		const pages = [
			...(ref.current?.querySelectorAll(':scope > section') ?? []),
		] as HTMLElement[]
		if (pages.length !== pageCount) {
			setPageCount(pages.length)
			return
		}
		pages.forEach((page, index) => placePage(page, index, sideBySide))
	}, [children, pageCount, sideBySide])

	const rings = Array.from({ length: ringCount(setup) }, (_, index) => (
		<span key={index} className={styles.ring} />
	))
	return (
		<div
			ref={ref}
			className={sideBySide ? styles.sideBySideSpreads : styles.stackedSpreads}
			style={{ '--binding-width': `${BINDING_WIDTH}mm` } as SpreadsStyle}
		>
			{children}
			{Array.from({ length: spreadCount(pageCount) }, (_, spread) => (
				<div
					key={spread}
					className={styles.binding}
					style={
						sideBySide
							? { gridRow: spread + 1, gridColumn: 2 }
							: { gridRow: 3 * spread + 2, gridColumn: 1 }
					}
					aria-hidden
				>
					{rings}
				</div>
			))}
		</div>
	)
}
