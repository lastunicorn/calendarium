import { describe, expect, it } from 'vitest'
import { WEEK_PER_PAGE_SPEC } from '../../../layouts/week-per-page/options'
import { formSectionTitles } from '../../../test/formSections'
import { WeekPerPageForm } from './WeekPerPageForm'

describe('WeekPerPageForm', () => {
	it('shows the header, mini calendar and content options', () => {
		expect(formSectionTitles(WeekPerPageForm, WEEK_PER_PAGE_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
	})
})
