import type { ReactNode } from 'react'
import type { Spine } from '../../core/paper'
import styles from './Spreads.module.css'

interface SpreadsProps {
	/** Where the pages are bound: spreads side by side for a `left` spine, stacked for a `top` one. */
	spine: Spine
	/** The layout's pages, in reading order. */
	children: ReactNode
}

/**
 * The layout's pages on screen as the bound calendar shows them open: the first page alone, on the
 * right of the spine (or below it), then every even page facing the odd one after it. Only the
 * preview's arrangement: each page still prints on its own sheet, in reading order.
 */
export function Spreads({ spine, children }: SpreadsProps) {
	return (
		<div className={spine === 'left' ? styles.sideBySideSpreads : styles.stackedSpreads}>
			{children}
		</div>
	)
}
