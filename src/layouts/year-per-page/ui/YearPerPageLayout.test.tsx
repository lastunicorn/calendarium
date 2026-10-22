import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { YEAR_PER_PAGE_SPEC } from '../options'
import { YearPerPageLayout } from './YearPerPageLayout'

// What the layout plans is tested in `layouts/year-per-page/pages.test.ts`; these check that the
// component draws the plan.
describe('YearPerPageLayout', () => {
	it('draws the whole year on one page', () => {
		const options = { ...YEAR_PER_PAGE_SPEC.defaults(), year: 2025 }
		const { container } = render(<YearPerPageLayout options={options} />)
		expect(container.querySelectorAll('section')).toHaveLength(1)
	})
})
