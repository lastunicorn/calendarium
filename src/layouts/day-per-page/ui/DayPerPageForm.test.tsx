import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DAY_PER_PAGE_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { DayPerPageForm } from './DayPerPageForm'

describe('DayPerPageForm', () => {
	it('shows the header, mini calendar and content options, without a title', () => {
		expect(formSectionTitles(DayPerPageForm, DAY_PER_PAGE_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})
})
