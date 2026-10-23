import { pageDimensions, type PageSetup } from '../../core/paper'

/** The gap between facing pages on screen, where the binding's rings are drawn, in mm. */
export const BINDING_WIDTH = 8

/** The distance between two rings of the binding, in mm. */
const RING_PITCH = 12

/** How many spreads `pageCount` pages make: the first page alone, then two by two. */
export function spreadCount(pageCount: number): number {
	return pageCount === 0 ? 0 : Math.floor(pageCount / 2) + 1
}

/** The spread page `index` (from 0) is on, and its side: `0` before the spine, `1` after it. */
export function spreadOf(index: number): { spread: number; side: 0 | 1 } {
	return { spread: Math.floor((index + 1) / 2), side: index % 2 === 0 ? 1 : 0 }
}

/** The rings binding a spread, one every `RING_PITCH` along the spine. */
export function ringCount(page: Pick<PageSetup, 'paperSize' | 'orientation' | 'spine'>): number {
	const { width, height } = pageDimensions(page.paperSize, page.orientation)
	return Math.floor((page.spine === 'left' ? height : width) / RING_PITCH)
}

/** Width and height in mm of a spread on screen: two pages either side of the binding. */
export function spreadDimensions(page: Pick<PageSetup, 'paperSize' | 'orientation' | 'spine'>): {
	width: number
	height: number
} {
	const { width, height } = pageDimensions(page.paperSize, page.orientation)
	return page.spine === 'left'
		? { width: 2 * width + BINDING_WIDTH, height }
		: { width, height: 2 * height + BINDING_WIDTH }
}
