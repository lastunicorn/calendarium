import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DAILY_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { DailyForm } from './DailyForm'

describe('DailyForm', () => {
	it('shows the header, mini calendar and content options, without a title', () => {
		expect(formSectionTitles(DailyForm, DAILY_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Mini calendar',
			'Content',
			'Footer',
			'Page',
		])
		expect(screen.queryByLabelText('Title')).toBeNull()
	})
})
