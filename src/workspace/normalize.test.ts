import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS, normalizeLayout } from '../layouts'
import { defaultWorkspace, openProject } from './Workspace'
import { workspaceReducer } from './workspaceReducer'
import { LEGACY_FILE_FORMAT } from './legacy'
import { parseProjectFile } from './projectFile'

// Each layout's own rules are tested in its `options.test.ts`; these check the page rules every
// layout shares, and that every layout's options in state pass through its layout's rules.

const DIFFERING = { top: 5, right: 10, bottom: 15, left: 20 }

describe('normalizeLayout', () => {
	it('applies the page rules in every layout', () => {
		for (const layout of LAYOUT_IDS) {
			const workspace = defaultLayoutOptions(layout)
			expect(workspace.page.equalMargins).toBe(true)
			const differing = { ...workspace.page, margins: DIFFERING }
			expect(normalizeLayout(layout, { ...workspace, page: differing }).page).toEqual({
				...differing,
				equalMargins: false,
			})
			const mirrored = { ...workspace.page, mirrorMargins: true }
			expect(
				normalizeLayout(layout, { ...workspace, page: mirrored }).page.equalMargins,
			).toBe(false)
		}
	})

	it('keeps the differing margins of settings saved before equal margins', () => {
		const file = {
			format: LEGACY_FILE_FORMAT,
			version: 5,
			layout: 'day-per-page',
			page: { margins: DIFFERING },
		}
		const opened = parseProjectFile(JSON.stringify(file), 'day.json')
		expect(opened.ok && opened.project.options.page).toMatchObject({
			margins: DIFFERING,
			equalMargins: false,
		})
	})

	it('applies to every reducer change of a project’s options', () => {
		const layout = 'monthly'
		const { page } = defaultLayoutOptions(layout)
		const id = '00000000-0000-4000-8000-000000000001'
		const created = workspaceReducer(defaultWorkspace(), {
			type: 'createProject',
			id,
			name: '',
			layout,
		})
		const updated = workspaceReducer(created, {
			type: 'updateOptions',
			layout,
			patch: { page: { mirrorMargins: true } },
		})
		expect(openProject(updated)?.options.page.equalMargins).toBe(false)

		const imported = workspaceReducer(defaultWorkspace(), {
			type: 'importProject',
			project: {
				id,
				name: '',
				layout,
				options: { ...defaultLayoutOptions(layout), page: { ...page, margins: DIFFERING } },
			},
		})
		expect(openProject(imported)?.options.page.equalMargins).toBe(false)
	})
})
