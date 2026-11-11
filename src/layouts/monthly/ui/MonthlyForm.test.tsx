import { describe, expect, it } from 'vitest'
import { MONTHLY_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { MonthlyForm } from './MonthlyForm'

describe('MonthlyForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(MonthlyForm, MONTHLY_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})
})
