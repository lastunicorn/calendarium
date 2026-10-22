import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { commonDefaults } from '../../layouts/common'
import type { PageSetup } from '../../core/paper'
import { Page } from '../layouts/Page'
import { Booklet } from './Booklet'

/** A booklet of `count` pages, each holding its number, with the default page setup and `changes`. */
function bookletOf(count: number, changes: Partial<PageSetup> = {}) {
	const setup = { ...commonDefaults().page, booklet: true, ...changes }
	const { container } = render(
		<Booklet setup={setup}>
			{Array.from({ length: count }, (_, index) => (
				<Page key={index} setup={setup}>
					{index + 1}
				</Page>
			))}
		</Booklet>,
	)
	return [...container.querySelectorAll('section')]
}

/** Where each page is on the grid, as `row/column`. */
function placesOf(pages: HTMLElement[]) {
	return pages.map((page) => `${page.style.gridRow}/${page.style.gridColumn}`)
}

describe('Booklet', () => {
	it('completes the last sheet with blank pages, at the end', () => {
		const pages = bookletOf(5)
		expect(pages).toHaveLength(8)
		expect(pages.map((page) => page.textContent)).toEqual(['1', '2', '3', '4', '5', '', '', ''])
	})

	it('places portrait pages side by side, a row per side of a sheet', () => {
		// Sides: [4, 1], [2, 3].
		expect(placesOf(bookletOf(4))).toEqual(['1/2', '2/1', '2/2', '1/1'])
	})

	it('places landscape pages one above the other, two rows per side of a sheet', () => {
		expect(placesOf(bookletOf(4, { orientation: 'landscape' }))).toEqual([
			'2/1',
			'3/1',
			'4/1',
			'1/1',
		])
	})

	it('starts a printed sheet at the first page of every side but the first', () => {
		const starts = bookletOf(8).map((page) => page.hasAttribute('data-side-start'))
		// Sides: [8, 1], [2, 7], [6, 3], [4, 5].
		expect(starts).toEqual([false, true, false, true, false, true, false, false])
	})
})
