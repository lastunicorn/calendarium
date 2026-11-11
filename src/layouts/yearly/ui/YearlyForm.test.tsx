import { describe, expect, it } from 'vitest'
import { YEARLY_SPEC } from '../options'
import { formSectionTitles } from '../../../test/formSections'
import { YearlyForm } from './YearlyForm'

describe('YearlyForm', () => {
	it('shows the header and content options', () => {
		expect(formSectionTitles(YearlyForm, YEARLY_SPEC.defaults())).toEqual([
			'Calendar',
			'Events',
			'Header',
			'Content',
			'Page',
		])
	})
})
