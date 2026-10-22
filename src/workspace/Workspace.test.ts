import { describe, expect, it } from 'vitest'
import { defaultWorkspace, isNewProject } from './Workspace'
import { workspaceReducer } from './workspaceReducer'

describe('isNewProject', () => {
	it('holds for the defaults, and again once a changed project is started over', () => {
		const workspace = defaultWorkspace()
		expect(isNewProject(workspace)).toBe(true)

		const changed = workspaceReducer(workspace, {
			type: 'update',
			layout: workspace.layout,
			patch: { year: 2030 },
		})
		expect(isNewProject(changed)).toBe(false)

		const started = workspaceReducer(changed, { type: 'newProject', layout: changed.layout })
		expect(isNewProject(started)).toBe(true)
	})

	it('looks only at the shown layout’s project', () => {
		let workspace = workspaceReducer(defaultWorkspace(), {
			type: 'update',
			layout: 'day-per-page',
			patch: { firstHour: 3 },
		})
		expect(isNewProject(workspace)).toBe(true)
		workspace = workspaceReducer(workspace, { type: 'selectLayout', layout: 'day-per-page' })
		expect(isNewProject(workspace)).toBe(false)
	})
})
