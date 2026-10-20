import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type AppConfig, defaultAppConfig } from '../../config/AppConfig'
import type { LayoutId } from '../../layouts'
import { Preview } from './Preview'

function noop() {}

/** The default config showing `layout` for `year`. */
function configFor(layout: LayoutId, year: number): AppConfig {
	const config = defaultAppConfig()
	config.layout = layout
	config.layouts[layout].year = year
	config.layouts[layout].weekStart = 1
	return config
}

// What each layout plans is tested in `layouts/*/pages.test.ts`; these check that the preview
// draws the plans: a page count per layout, and what only the markup shows.

/** How many sheets of paper the preview draws (each `Page` is a `<section>`). */
function pageCount(layout: LayoutId, year: number): number {
	const { container } = render(<Preview config={configFor(layout, year)} onResetLayout={noop} />)
	return container.querySelectorAll('section').length
}

describe('Preview', () => {
	it('draws the whole year on one page', () => {
		expect(pageCount('year-per-page', 2025)).toBe(1)
	})

	it('draws a page per month', () => {
		expect(pageCount('month-per-page', 2025)).toBe(12)
	})

	it('draws a page per week holding a day of the year', () => {
		// Monday weeks: 2025 runs from Dec 30, 2024 to Jan 4, 2026.
		expect(pageCount('week-per-page', 2025)).toBe(53)
	})

	it('spreads each week over two pages, with the heading on the first only', () => {
		const config = configFor('week-per-page', 2025)
		Object.assign(config.layouts['week-per-page'], {
			weekendDisplay: 'full',
			twoPagesPerWeek: true,
		})
		const { container } = render(<Preview config={config} onResetLayout={noop} />)
		const pages = container.querySelectorAll('section')
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
		const config = configFor('week-per-page', 2025)
		const week = config.layouts['week-per-page']
		Object.assign(week, { twoPagesPerWeek: true, miniMonth: { ...week.miniMonth, show: true } })
		const { container } = render(<Preview config={config} onResetLayout={noop} />)
		const [first, second] = container.querySelectorAll('section')
		// The week of 30 December 2024 is mostly in January.
		const miniMonth = (page: Element) =>
			[...page.querySelectorAll('h2')].find((name) => name.textContent === 'January')
		expect(miniMonth(first)?.closest('[aria-hidden]')).not.toBeNull()
		expect(miniMonth(second)?.closest('[aria-hidden]')).toBeNull()
		expect(first.querySelector('h1')?.closest('[aria-hidden]')).toBeNull()
		expect(second.querySelector('h1')?.closest('[aria-hidden]')).not.toBeNull()
	})

	it('draws a page per day', () => {
		expect(pageCount('day-per-page', 2025)).toBe(365)
	})

	it('draws a day’s second page with the rest of its hours and no header', () => {
		const config = configFor('day-per-page', 2025)
		Object.assign(config.layouts['day-per-page'], {
			twoPagesPerDay: true,
			dayPageLines: 'hours',
			hourFormat: '24h',
			firstHour: 8,
			lastHour: 13,
		})
		const { container } = render(<Preview config={config} onResetLayout={noop} />)
		const pages = container.querySelectorAll('section')
		expect(pages).toHaveLength(730)
		expect(pages[0].textContent).toContain('10:00')
		expect(pages[1].textContent).toContain('11:00')
		expect(pages[1].querySelector('h1, h2, h3')).toBeNull()
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview config={configFor('month-per-page', 2025)} onResetLayout={noop} />,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})
})
