import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../layouts'
import type { Project } from './Project'
import { defaultWorkspace, openProject, projectList, type Workspace } from './Workspace'

/** The `n`th test id, a valid project id that sorts by `n`. */
function id(n: number): string {
	return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

/** A yearly project named `name`, with the `n`th test id. */
function project(n: number, name: string): Project {
	return { id: id(n), name, layout: 'yearly', options: defaultLayoutOptions('yearly') }
}

/** A workspace of `projects`, `open` open. */
function workspaceOf(projects: Project[], open: string | null = null): Workspace {
	return { projects: Object.fromEntries(projects.map((p) => [p.id, p])), open }
}

describe('defaultWorkspace', () => {
	it('has no project, and none open', () => {
		expect(defaultWorkspace()).toEqual({ projects: {}, open: null })
	})
})

describe('openProject', () => {
	it('is the open project', () => {
		const work = project(1, 'Work')
		expect(openProject(workspaceOf([work, project(2, 'Home')], work.id))).toBe(work)
	})

	it('is null when none is open, or the open id names none', () => {
		expect(openProject(defaultWorkspace())).toBeNull()
		expect(openProject(workspaceOf([project(1, 'Work')]))).toBeNull()
		expect(openProject(workspaceOf([project(1, 'Work')], id(2)))).toBeNull()
		expect(openProject(workspaceOf([], 'toString'))).toBeNull()
	})
})

describe('projectList', () => {
	it('lists the projects by name, ignoring the spaces around it', () => {
		const projects = [project(1, 'b'), project(2, ' C'), project(3, 'a ')]
		expect(projectList(workspaceOf(projects)).map((p) => p.name)).toEqual(['a ', 'b', ' C'])
	})

	it('lists the unnamed ones last', () => {
		const projects = [project(1, ''), project(2, 'Zoo'), project(3, '  '), project(4, 'Ant')]
		expect(projectList(workspaceOf(projects)).map((p) => p.id)).toEqual([
			id(4),
			id(2),
			id(1),
			id(3),
		])
	})

	it('orders projects of the same name by id, whatever order they were added in', () => {
		const projects = [project(3, 'Plan'), project(1, 'Plan'), project(2, 'Plan')]
		expect(projectList(workspaceOf(projects)).map((p) => p.id)).toEqual([id(1), id(2), id(3)])
	})

	it('is empty without projects', () => {
		expect(projectList(defaultWorkspace())).toEqual([])
	})
})
