import type { MiniMonthSize } from '../../layouts/monthGrid'
import styles from './MiniMonth.module.css'

/**
 * The class defining a mini month's size, none without one: on a layout's header, it gives
 * `--mini-month-width` and `--mini-month-height` to size the corner the mini month fills; on the
 * `MiniMonth`, its text.
 */
export function miniMonthSizeClass(size: MiniMonthSize | undefined): string {
	return size === undefined ? '' : styles[size]
}
