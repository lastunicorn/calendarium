import { describe, expect, it } from 'vitest'

import { TEST_ENV } from '../../../test/environment'
import { formSectionTitles } from '../../../test/formSections'
import { MONTHLY_SPEC } from '../options'
import { MonthlyForm } from './MonthlyForm'

describe('MonthlyForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(MonthlyForm, MONTHLY_SPEC.defaults(TEST_ENV))).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})
})
