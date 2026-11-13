import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../layouts'
import type { Project } from './Project'
import { defaultWorkspace, openProject, type Workspace } from './Workspace'
import { workspaceReducer } from './workspaceReducer'

/** The `n`th test id, a valid project id that sorts by `n`. */
function id(n: number): string {
	return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

/** A workspace with projects created by name, each of `layout`, the last one open. */
function created(names: string[], layout: Project['layout'] = 'yearly'): Workspace {
	return names.reduce(
		(workspace, name, i) =>
			workspaceReducer(workspace, { type: 'createProject', id: id(i + 1), name, layout }),
		defaultWorkspace(),
	)
}

describe('createProject', () => {
	it('adds a project with its layout’s defaults, and opens it', () => {
		const workspace = workspaceReducer(created(['Home']), {
			type: 'createProject',
			id: id(9),
			name: 'Work',
			layout: 'weekly',
		})
		expect(workspace.open).toBe(id(9))
		expect(workspace.projects[id(9)]).toEqual({
			id: id(9),
			name: 'Work',
			layout: 'weekly',
			options: defaultLayoutOptions('weekly'),
		})
		expect(Object.keys(workspace.projects)).toEqual([id(1), id(9)])
	})

	it('changes nothing for an id already taken', () => {
		const workspace = created(['Home'])
		expect(
			workspaceReducer(workspace, {
				type: 'createProject',
				id: id(1),
				name: 'Work',
				layout: 'daily',
			}),
		).toBe(workspace)
	})
})

describe('openProject', () => {
	it('opens another project, keeping every project as it was', () => {
		const workspace = created(['Home', 'Work'])
		const opened = workspaceReducer(workspace, { type: 'openProject', id: id(1) })
		expect(opened.open).toBe(id(1))
		expect(opened.projects).toBe(workspace.projects)
	})

	it('changes nothing for an unknown id or the open project', () => {
		const workspace = created(['Home', 'Work'])
		for (const unknown of [id(9), 'toString', id(2)]) {
			expect(workspaceReducer(workspace, { type: 'openProject', id: unknown })).toBe(
				workspace,
			)
		}
	})
})

describe('renameProject', () => {
	it('renames the open project only, keeping the name as typed', () => {
		const workspace = created(['Home', 'Work'])
		const renamed = workspaceReducer(workspace, { type: 'renameProject', name: ' Office ' })
		expect(renamed.projects[id(2)].name).toBe(' Office ')
		expect(renamed.projects[id(2)].options).toBe(workspace.projects[id(2)].options)
		expect(renamed.projects[id(1)]).toBe(workspace.projects[id(1)])
	})

	it('changes nothing for the same name, or without an open project', () => {
		const workspace = created(['Home'])
		expect(workspaceReducer(workspace, { type: 'renameProject', name: 'Home' })).toBe(workspace)
		const none = defaultWorkspace()
		expect(workspaceReducer(none, { type: 'renameProject', name: 'Home' })).toBe(none)
	})
})

describe('updateOptions', () => {
	it('changes only the patched fields of the open project', () => {
		const workspace = created(['Home', 'Work'])
		const updated = workspaceReducer(workspace, {
			type: 'updateOptions',
			layout: 'yearly',
			patch: { calendar: { year: 2030 }, header: { title: 'Hi' } },
		})
		const defaults = defaultLayoutOptions('yearly')
		expect(updated.projects[id(2)]).toEqual({
			...workspace.projects[id(2)],
			options: {
				...defaults,
				calendar: { ...defaults.calendar, year: 2030 },
				header: { ...defaults.header, title: 'Hi' },
			},
		})
		expect(updated.projects[id(1)]).toBe(workspace.projects[id(1)])
	})

	it('patches a nested object field by field, then applies the layout’s rules', () => {
		const workspace = created(['Day'], 'daily')
		const updated = workspaceReducer(workspace, {
			type: 'updateOptions',
			layout: 'daily',
			patch: { page: { margins: { top: 5 } }, miniMonth: { size: 'large' } },
		})
		const { page, miniMonth } = defaultLayoutOptions('daily')
		expect(openProject(updated)?.options).toMatchObject({
			// The top margin alone changed, so the margins are no longer equal.
			page: { ...page, margins: { ...page.margins, top: 5 }, equalMargins: false },
			miniMonth: { ...miniMonth, size: 'large' },
		})
	})

	it('changes nothing when the patch changes nothing', () => {
		const workspace = created(['Week'], 'weekly')
		const { calendar, page } = defaultLayoutOptions('weekly')
		const patch = {
			calendar: { year: calendar.year },
			page: { margins: { top: page.margins.top } },
		}
		expect(
			workspaceReducer(workspace, { type: 'updateOptions', layout: 'weekly', patch }),
		).toBe(workspace)
	})

	it('is ignored for another layout than the open project’s, or without one', () => {
		const workspace = created(['Week'], 'weekly')
		const action = {
			type: 'updateOptions',
			layout: 'yearly',
			patch: { header: { title: 'Hi' } },
		} as const
		expect(workspaceReducer(workspace, action)).toBe(workspace)
		const none = defaultWorkspace()
		expect(workspaceReducer(none, action)).toBe(none)
	})

	it('leaves the previous workspace untouched', () => {
		const workspace = created(['Day'], 'daily')
		const before = structuredClone(workspace)
		const updated = workspaceReducer(workspace, {
			type: 'updateOptions',
			layout: 'daily',
			patch: { miniMonth: { showWeekNumbers: false } },
		})
		expect(updated).not.toBe(workspace)
		expect(workspace).toEqual(before)
	})
})

describe('resetOptions', () => {
	it('puts the open project’s options back to the defaults, keeping its id and name', () => {
		let workspace = created(['Home', 'Work'], 'daily')
		workspace = workspaceReducer(workspace, {
			type: 'updateOptions',
			layout: 'daily',
			patch: { calendar: { year: 1999 }, content: { schedule: { firstHour: 3 } } },
		})
		const reset = workspaceReducer(workspace, { type: 'resetOptions' })
		expect(reset.projects[id(2)]).toEqual({
			id: id(2),
			name: 'Work',
			layout: 'daily',
			options: defaultLayoutOptions('daily'),
		})
		expect(reset.projects[id(1)]).toBe(workspace.projects[id(1)])
		expect(reset.open).toBe(id(2))
	})

	it('changes nothing without an open project', () => {
		const none = defaultWorkspace()
		expect(workspaceReducer(none, { type: 'resetOptions' })).toBe(none)
	})
})

describe('deleteProject', () => {
	// Listed by name: a (1), b (2), c (3).
	const workspace = created(['b', 'c', 'a'])

	it('removes a project that is not open, keeping the open one', () => {
		const deleted = workspaceReducer(workspace, { type: 'deleteProject', id: id(1) })
		expect(Object.keys(deleted.projects).toSorted()).toEqual([id(2), id(3)])
		expect(deleted.open).toBe(id(3))
	})

	it('opens the next project in the list when the open one is deleted', () => {
		const deleted = workspaceReducer(workspace, { type: 'deleteProject', id: id(3) })
		expect(deleted.projects).not.toHaveProperty(id(3))
		expect(deleted.open).toBe(id(1))
	})

	it('opens the previous one when the open one was the last listed', () => {
		const opened = workspaceReducer(workspace, { type: 'openProject', id: id(2) })
		expect(workspaceReducer(opened, { type: 'deleteProject', id: id(2) }).open).toBe(id(1))
	})

	it('opens none once the last project is deleted', () => {
		const deleted = workspaceReducer(created(['Only']), { type: 'deleteProject', id: id(1) })
		expect(deleted).toEqual({ projects: {}, open: null })
	})

	it('changes nothing for an unknown id', () => {
		for (const unknown of [id(9), 'toString']) {
			expect(workspaceReducer(workspace, { type: 'deleteProject', id: unknown })).toBe(
				workspace,
			)
		}
	})
})

describe('importProject', () => {
	const defaults = defaultLayoutOptions('monthly')
	const imported: Project = {
		id: id(9),
		name: 'Office',
		layout: 'monthly',
		options: { ...defaults, calendar: { ...defaults.calendar, year: 1999 } },
	}

	it('adds a project with a new id and opens it', () => {
		const workspace = workspaceReducer(created(['Home']), {
			type: 'importProject',
			project: imported,
		})
		expect(workspace.open).toBe(id(9))
		expect(workspace.projects[id(9)]).toBe(imported)
		expect(Object.keys(workspace.projects)).toEqual([id(1), id(9)])
	})

	it('replaces the project with its id whole, name and layout included, and opens it', () => {
		const workspace = created(['Home', 'Work'], 'daily')
		const replaced = workspaceReducer(workspace, {
			type: 'importProject',
			project: { ...imported, id: id(1) },
		})
		expect(replaced.open).toBe(id(1))
		expect(replaced.projects[id(1)]).toEqual({ ...imported, id: id(1) })
		expect(replaced.projects[id(2)]).toBe(workspace.projects[id(2)])
	})

	it('applies the layout’s rules to the imported options', () => {
		const margins = { top: 5, right: 10, bottom: 15, left: 20 }
		const project = {
			...imported,
			options: { ...imported.options, page: { ...imported.options.page, margins } },
		}
		const workspace = workspaceReducer(defaultWorkspace(), { type: 'importProject', project })
		expect(workspace.projects[id(9)].options.page.equalMargins).toBe(false)
	})
})
