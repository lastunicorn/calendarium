import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MONTHLY_SPEC } from '../options'
import { MonthlyLayout } from './MonthlyLayout'

// What the layout plans is tested in `layouts/monthly/pages.test.ts`; these check that the
// component draws the plan.
describe('MonthlyLayout', () => {
	it('draws a page per month', () => {
		const defaults = MONTHLY_SPEC.defaults()
		const options = { ...defaults, calendar: { ...defaults.calendar, year: 2025 } }
		const { container } = render(<MonthlyLayout options={options} />)
		expect(container.querySelectorAll('section')).toHaveLength(12)
	})
})
