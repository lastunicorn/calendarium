// The imposition of a booklet: which pages go on each side of its sheets, so that the sheets,
// printed double-sided, stacked in order and folded in half together, read in page order.

/** The pages of a booklet holding `pageCount`: a multiple of 4, as each sheet holds 4 pages. */
export function bookletPageCount(pageCount: number): number {
	return Math.ceil(pageCount / 4) * 4
}

/**
 * The two pages on each side of a booklet's sheets, in print order (the first sheet's front, its
 * back, the second sheet's front…), as 0-based page indices: first the one left of the fold (or
 * above it), then the one right of it (or below). The pages past `pageCount`, up to
 * `bookletPageCount`, are blank. The first sheet's front holds the last page and the first, the
 * covers; its back, printed flipping on the short edge, the second page and the one before last.
 */
export function bookletSides(pageCount: number): [number, number][] {
	const last = bookletPageCount(pageCount) - 1
	const sides: [number, number][] = []
	for (let page = 0; page < last - page; page += 2) {
		sides.push([last - page, page], [page + 1, last - page - 1])
	}
	return sides
}
