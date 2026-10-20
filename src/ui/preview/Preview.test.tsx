import { cleanup, render } from '@testing-library/react'
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

	it('draws 54 week pages when a leap year starts on the last day of a week', () => {
		// 2028 starts on a Saturday: Sunday weeks run from Dec 26, 2027 to Jan 6, 2029.
		const config = configFor('week-per-page', 2028)
		config.layouts['week-per-page'].weekStart = 0
		const { container } = render(<Preview config={config} onResetLayout={noop} />)
		expect(container.querySelectorAll('section')).toHaveLength(54)
	})

	it('skips a week whose only days of the year are a hidden weekend', () => {
		// 2022 starts on a Saturday: its first Monday week holds only January 1 and 2.
		const config = configFor('week-per-page', 2022)
		expect(pageCount('week-per-page', 2022)).toBe(53)
		config.layouts['week-per-page'].weekendDisplay = 'hidden'
		const { container } = render(<Preview config={config} onResetLayout={noop} />)
		expect(container.querySelectorAll('section')).toHaveLength(52)
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

	it('draws an hourly schedule in each day of the year, except in a shared weekend cell', () => {
		const config = configFor('week-per-page', 2025)
		Object.assign(config.layouts['week-per-page'], {
			weekendDisplay: 'full',
			weekPageLines: 'hours',
			hourFormat: '24h',
			firstHour: 7,
			lastHour: 7,
		})
		const hourLabels = () =>
			render(<Preview config={config} onResetLayout={noop} />).queryAllByText('07:00')
		// One schedule per day of 2025, none for the days of 2024 and 2026 on the first and last page.
		expect(hourLabels()).toHaveLength(365)
		cleanup()
		// Its 104 weekend days share cells.
		config.layouts['week-per-page'].weekendDisplay = 'reduced'
		expect(hourLabels()).toHaveLength(261)
		cleanup()
		// A week starting on Sunday can't reduce its weekend, so its cells keep the schedule.
		config.layouts['week-per-page'].weekStart = 0
		expect(hourLabels()).toHaveLength(365)
	})

	it('draws a page per day, with February 29 in a leap year', () => {
		expect(pageCount('day-per-page', 2025)).toBe(365)
		expect(pageCount('day-per-page', 2024)).toBe(366)
	})

	it('draws two pages per day, splitting the hours evenly between them', () => {
		const config = configFor('day-per-page', 2025)
		Object.assign(config.layouts['day-per-page'], {
			twoPagesPerDay: true,
			dayPageLines: 'hours',
			hourFormat: '24h',
			firstHour: 8,
			lastHour: 13,
		})
		const { container, getAllByText } = render(<Preview config={config} onResetLayout={noop} />)
		const pages = container.querySelectorAll('section')
		expect(pages).toHaveLength(730)
		// 08:00–10:00 under the header, 11:00–13:00 on the next page, which has no heading.
		expect(pages[0].textContent).toContain('10:00')
		expect(pages[0].textContent).not.toContain('11:00')
		expect(pages[1].textContent).toContain('11:00')
		expect(pages[1].textContent).toContain('13:00')
		expect(pages[1].textContent).not.toContain('10:00')
		expect(pages[1].querySelector('h1, h2, h3')).toBeNull()
		expect(getAllByText('08:00')).toHaveLength(365)
		expect(getAllByText('13:00')).toHaveLength(365)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview config={configFor('month-per-page', 2025)} onResetLayout={noop} />,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})
})
