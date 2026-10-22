import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MONTH_PER_PAGE_SPEC } from '../../../layouts/month-per-page/options'
import { MonthPerPageLayout } from './MonthPerPageLayout'

// What the layout plans is tested in `layouts/month-per-page/pages.test.ts`; these check that the
// component draws the plan.
describe('MonthPerPageLayout', () => {
	it('draws a page per month', () => {
		const config = { ...MONTH_PER_PAGE_SPEC.defaults(), year: 2025 }
		const { container } = render(<MonthPerPageLayout config={config} />)
		expect(container.querySelectorAll('section')).toHaveLength(12)
	})
})
