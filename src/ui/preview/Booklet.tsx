import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { bookletPageCount, bookletSides } from '../../core/booklet'
import type { PageSetup } from '../../core/paper'
import { Page } from '../layouts/Page'
import styles from './Booklet.module.css'

interface BookletProps {
	setup: PageSetup
	/** The layout's pages, in reading order. */
	children: ReactNode
}

/**
 * Puts `page` in its place on the grid: side by side, a sheet's side is a row of two pages; one
 * above the other, two rows. The first page of every side but the first starts a printed sheet.
 */
function placePage(page: HTMLElement, side: number, slot: number, stacked: boolean) {
	page.style.gridRow = String(stacked ? 2 * side + slot + 1 : side + 1)
	page.style.gridColumn = String(stacked ? 1 : slot + 1)
	page.toggleAttribute('data-side-start', side > 0 && slot === 0)
}

/**
 * The layout's pages arranged as a booklet's sheets (`bookletSides`): two on each side of the
 * paper, portrait pages side by side and landscape ones one above the other, after blank pages
 * completing the last sheet. The pages stay in reading order in the document, so mirrored margins
 * still count them as they read; only the grid places them, from the pages actually drawn, as no
 * layout says how many it draws.
 */
export function Booklet({ setup, children }: BookletProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [blankPages, setBlankPages] = useState(0)
	const stacked = setup.orientation === 'landscape'

	// The layout's pages may change with any new children: their count first, then their places.
	useLayoutEffect(() => {
		const pages = [...(ref.current?.children ?? [])] as HTMLElement[]
		const drawn = pages.length - blankPages
		const blanks = bookletPageCount(drawn) - drawn
		if (blanks !== blankPages) {
			setBlankPages(blanks)
			return
		}
		bookletSides(pages.length).forEach(([first, second], side) => {
			placePage(pages[first], side, 0, stacked)
			placePage(pages[second], side, 1, stacked)
		})
	}, [children, blankPages, stacked])

	return (
		<div
			ref={ref}
			className={`${styles.booklet} ${stacked ? styles.stacked : styles.sideBySide}`}
		>
			{children}
			{Array.from({ length: blankPages }, (_, index) => (
				<Page key={index} setup={setup} />
			))}
		</div>
	)
}
