import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DAY_PER_PAGE_SPEC, type DayPerPageConfig } from '../../../layouts/day-per-page/options'
import { DayPerPageLayout } from './DayPerPageLayout'

/** The default options for 2025, with `options` on top. */
function configWith(options: Partial<DayPerPageConfig> = {}): DayPerPageConfig {
	return { ...DAY_PER_PAGE_SPEC.defaults(), year: 2025, ...options }
}

/** The sheets of paper the layout draws (each `Page` is a `<section>`). */
function pagesOf(config: DayPerPageConfig) {
	const { container } = render(<DayPerPageLayout config={config} />)
	return container.querySelectorAll('section')
}

// What the layout plans is tested in `layouts/day-per-page/pages.test.ts`; these check that the
// component draws the plan, and what only the markup shows.
describe('DayPerPageLayout', () => {
	it('draws a page per day', () => {
		expect(pagesOf(configWith())).toHaveLength(365)
	})

	it('draws a day’s second page with the rest of its hours and no header', () => {
		const pages = pagesOf(
			configWith({
				twoPagesPerDay: true,
				dayPageLines: 'hours',
				hourFormat: '24h',
				firstHour: 8,
				lastHour: 13,
			}),
		)
		expect(pages).toHaveLength(730)
		expect(pages[0].textContent).toContain('10:00')
		expect(pages[1].textContent).toContain('11:00')
		expect(pages[1].querySelector('h1, h2, h3')).toBeNull()
	})
})
