import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WEEK_PER_PAGE_SPEC, type WeekPerPageOptions } from '../options'
import { WeekPerPageLayout } from './WeekPerPageLayout'

/** The default options for 2025 in Monday weeks, with `changes` on top. */
function optionsWith(changes: Partial<WeekPerPageOptions> = {}): WeekPerPageOptions {
	return { ...WEEK_PER_PAGE_SPEC.defaults(), year: 2025, weekStart: 1, ...changes }
}

/** The sheets of paper the layout draws (each `Page` is a `<section>`). */
function pagesOf(options: WeekPerPageOptions) {
	const { container } = render(<WeekPerPageLayout options={options} />)
	return container.querySelectorAll('section')
}

// What the layout plans is tested in `layouts/week-per-page/pages.test.ts`; these check that the
// component draws the plan, and what only the markup shows.
describe('WeekPerPageLayout', () => {
	it('draws a page per week holding a day of the year', () => {
		// Monday weeks: 2025 runs from Dec 30, 2024 to Jan 4, 2026.
		expect(pagesOf(optionsWith())).toHaveLength(53)
	})

	it('draws a blank page before the first week when it starts on an even page', () => {
		const pages = pagesOf(optionsWith({ startPage: 'even' }))
		expect(pages).toHaveLength(1 + 53)
		expect(pages[0].textContent).toBe('')
		expect(pages[1].textContent).toContain('Mon')
	})

	it('spreads each week over two pages, with the heading on the first only', () => {
		const pages = pagesOf(optionsWith({ weekendDisplay: 'full', twoPagesPerWeek: true }))
		expect(pages).toHaveLength(2 * 53)
		// Monday to Wednesday, then Thursday to Sunday.
		expect(pages[0].textContent).toContain('Wed')
		expect(pages[0].textContent).not.toContain('Thu')
		expect(pages[1].textContent).toContain('Thu')
		expect(pages[1].textContent).toContain('Sun')
		expect(pages[1].textContent).not.toContain('Wed')
		// The second page keeps the heading's space, hidden from assistive technology.
		expect(pages[0].querySelector('[aria-hidden] h1')).toBeNull()
		expect(pages[1].querySelector('h1')?.closest('[aria-hidden]')).not.toBeNull()
	})

	it('draws the mini month on the second of a week’s two pages, its space kept on the first', () => {
		const { miniMonth } = WEEK_PER_PAGE_SPEC.defaults()
		const [first, second] = pagesOf(
			optionsWith({ twoPagesPerWeek: true, miniMonth: { ...miniMonth, show: true } }),
		)
		// The week of 30 December 2024 is mostly in January.
		const miniMonthOf = (page: Element) =>
			[...page.querySelectorAll('h2')].find((name) => name.textContent === 'January')
		expect(miniMonthOf(first)?.closest('[aria-hidden]')).not.toBeNull()
		expect(miniMonthOf(second)?.closest('[aria-hidden]')).toBeNull()
		expect(first.querySelector('h1')?.closest('[aria-hidden]')).toBeNull()
		expect(second.querySelector('h1')?.closest('[aria-hidden]')).not.toBeNull()
	})

	it('draws the next month right of the week’s', () => {
		const [first] = pagesOf(optionsWith({ showNextMonth: true }))
		const names = [...first.querySelectorAll('h2')].map((name) => name.textContent)
		// The week of 30 December 2024 is mostly in January.
		expect(names).toEqual(['January', 'February'])
	})
})
