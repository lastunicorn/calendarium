import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AppConfig, LayoutId } from '../../config/CalendarConfig'
import { defaultAppConfig } from '../../config/layouts'
import { Preview } from './Preview'

function noop() {}

/** The default config showing `layout` for `year`. */
function configFor(layout: LayoutId, year: number): AppConfig {
	const config = defaultAppConfig()
	config.layout = layout
	config.layouts[layout].year = year
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

	it('draws a page per day, with February 29 in a leap year', () => {
		expect(pageCount('day-per-page', 2025)).toBe(365)
		expect(pageCount('day-per-page', 2024)).toBe(366)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview config={configFor('month-per-page', 2025)} onResetLayout={noop} />,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})
})
