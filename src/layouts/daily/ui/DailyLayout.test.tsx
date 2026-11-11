import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DAILY_SPEC, type DailyOptions } from '../options'
import { DailyLayout } from './DailyLayout'

/** The default options for 2025, with `changes` on top. */
function optionsWith(changes: Partial<DailyOptions> = {}): DailyOptions {
	return {
		...DAILY_SPEC.defaults(),
		calendar: { year: 2025, locale: 'en-GB', weekStart: 'auto' },
		...changes,
	}
}

/** The sheets of paper the layout draws (each `Page` is a `<section>`). */
function pagesOf(options: DailyOptions) {
	const { container } = render(<DailyLayout options={options} />)
	return container.querySelectorAll('section')
}

// What the layout plans is tested in `layouts/daily/pages.test.ts`; these check that the
// component draws the plan, and what only the markup shows.
describe('DailyLayout', () => {
	it('draws a page per day', () => {
		expect(pagesOf(optionsWith({ dayPageFill: 'blank' }))).toHaveLength(365)
	})

	it('draws a day’s second page with the rest of its hours and no header', () => {
		const pages = pagesOf(
			optionsWith({
				twoPagesPerDay: true,
				dayPageFill: 'hours',
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
