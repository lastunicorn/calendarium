import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { commonDefaults } from '../../layouts/common'
import type { PageSetup } from '../../core/paper'
import { Page } from '../layouts/Page'
import { Spreads } from './Spreads'

/** Spreads of `count` pages, with the default page setup and `changes`. */
function spreadsOf(count: number, changes: Partial<PageSetup> = {}) {
	const setup = { ...commonDefaults().page, ...changes }
	const { container } = render(
		<Spreads setup={setup}>
			{Array.from({ length: count }, (_, index) => (
				<Page key={index} setup={setup} />
			))}
		</Spreads>,
	)
	const box = container.firstElementChild!
	return {
		pages: [...box.querySelectorAll(':scope > section')] as HTMLElement[],
		bindings: [...box.querySelectorAll(':scope > div')] as HTMLElement[],
	}
}

/** Where each element is on the grid, as `row/column`. */
function placesOf(elements: HTMLElement[]) {
	return elements.map((element) => `${element.style.gridRow}/${element.style.gridColumn}`)
}

describe('Spreads', () => {
	it('places the first page alone right of the spine, then two pages a row', () => {
		const { pages, bindings } = spreadsOf(4)
		expect(placesOf(pages)).toEqual(['1/3', '2/1', '2/3', '3/1'])
		expect(placesOf(bindings)).toEqual(['1/2', '2/2', '3/2'])
	})

	it('stacks a spread’s pages either side of the binding with the spine at the top', () => {
		const { pages, bindings } = spreadsOf(3, { spine: 'top' })
		expect(placesOf(pages)).toEqual(['3/1', '4/1', '6/1'])
		expect(placesOf(bindings)).toEqual(['2/1', '5/1'])
	})

	it('keeps the pages first in the document, in reading order, for printing', () => {
		const { pages } = spreadsOf(3)
		expect(pages.every((page, index) => page.parentElement!.children[index] === page)).toBe(
			true,
		)
	})

	it('draws rings along the spine of every binding', () => {
		const { bindings } = spreadsOf(2)
		// A4 portrait: 297 mm along the spine, a ring every 12 mm.
		expect(bindings.map((binding) => binding.children.length)).toEqual([24, 24])
	})
})
