import { describe, expect, it } from 'vitest'
import { YEAR_PER_PAGE_SPEC } from '../../../layouts/year-per-page/options'
import { formSectionTitles } from '../../../test/formSections'
import { YearPerPageForm } from './YearPerPageForm'

describe('YearPerPageForm', () => {
	it('shows the header and content options', () => {
		expect(formSectionTitles(YearPerPageForm, YEAR_PER_PAGE_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Content',
			'Page',
		])
	})
})
