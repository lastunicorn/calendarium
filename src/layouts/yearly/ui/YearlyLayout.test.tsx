import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { YEARLY_SPEC } from '../options'
import { YearlyLayout } from './YearlyLayout'

// What the layout plans is tested in `layouts/yearly/pages.test.ts`; these check that the
// component draws the plan.
describe('YearlyLayout', () => {
	it('draws the whole year on one page', () => {
		const { container } = render(<YearlyLayout options={YEARLY_SPEC.defaults()} />)
		expect(container.querySelectorAll('section')).toHaveLength(1)
	})
})
