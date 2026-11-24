import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import { TEST_ENV } from '../../test/environment'
import { projectOf } from '../../workspace/Project'
import { defaultWorkspace, type Workspace } from '../../workspace/Workspace'
import { MAIN_CONTENTS, shownContent } from './mainContent'

const ID = '00000000-0000-4000-8000-000000000001'

/** A workspace holding one project, open. */
function withProject(): Workspace {
	const project = projectOf({
		id: ID,
		name: 'Home',
		layout: 'yearly',
		options: defaultLayoutOptions('yearly', TEST_ENV),
	})
	return { projects: { [ID]: project }, open: ID }
}

describe('shownContent', () => {
	it.each(MAIN_CONTENTS)(
		'shows Documents without a project, whatever is asked (%s)',
		(content) => {
			expect(shownContent(content, defaultWorkspace())).toBe('projects')
		},
	)

	it.each(MAIN_CONTENTS)('shows what is asked with a project open (%s)', (content) => {
		expect(shownContent(content, withProject())).toBe(content)
	})
})
