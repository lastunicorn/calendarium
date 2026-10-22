import { describe, expect, it } from 'vitest'
import { MONTH_PER_PAGE_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { MonthPerPageForm } from './MonthPerPageForm'

describe('MonthPerPageForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(MonthPerPageForm, MONTH_PER_PAGE_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})
})
