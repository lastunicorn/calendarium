import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import { TEST_ENV } from '../../test/environment'
import { projectOf, type ProjectId } from '../../workspace/Project'
import { defaultWorkspace, type Workspace } from '../../workspace/Workspace'
import { chosenProject } from './projectChoice'

const HOME = '00000000-0000-4000-8000-000000000001' as ProjectId
const WORK = '00000000-0000-4000-8000-000000000002' as ProjectId

/** A workspace holding Home and Work, Home open. */
function workspace(): Workspace {
	const project = (id: ProjectId, name: string) =>
		projectOf({ id, name, layout: 'yearly', options: defaultLayoutOptions('yearly', TEST_ENV) })
	return {
		projects: { [HOME]: project(HOME, 'Home'), [WORK]: project(WORK, 'Work') },
		open: HOME,
	}
}

describe('chosenProject', () => {
	it('gives the chosen project', () => {
		expect(chosenProject(workspace(), WORK)?.name).toBe('Work')
	})

	it('gives the open project when none is chosen, or the chosen one is gone', () => {
		expect(chosenProject(workspace(), null)?.name).toBe('Home')
		const gone = '00000000-0000-4000-8000-000000000009' as ProjectId
		expect(chosenProject(workspace(), gone)?.name).toBe('Home')
	})

	it('gives none without a project', () => {
		expect(chosenProject(defaultWorkspace(), null)).toBeNull()
	})
})
