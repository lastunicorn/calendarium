import { describe, expect, it } from 'vitest'

import { TEST_ENV } from '../../../test/environment'
import { formSectionTitles } from '../../../test/formSections'
import { YEARLY_SPEC } from '../options'
import { YearlyForm } from './YearlyForm'

describe('YearlyForm', () => {
	it('shows the header and content options', () => {
		expect(formSectionTitles(YearlyForm, YEARLY_SPEC.defaults(TEST_ENV))).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Content',
			'Page',
		])
	})
})
