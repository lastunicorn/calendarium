import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions } from '../layouts'
import { memoryStorage } from '../test/memoryStorage'
import type { Project } from './Project'
import { serializeProject } from './projectDocument'
import { loadWorkspace, saveWorkspace } from './storage'
import { APP_VERSION, FORMAT_VERSION } from './version'
import { defaultWorkspace, openProject, projectList, type Workspace } from './Workspace'

/** The `n`th test id, a valid project id that sorts by `n`. */
function id(n: number): string {
	return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

/** A monthly project with the `n`th test id, named `name`, of `year`. */
function monthly(n: number, name: string, year = 2031): Project {
	const defaults = defaultLayoutOptions('monthly')
	return {
		id: id(n),
		name,
		layout: 'monthly',
		options: { ...defaults, calendar: { ...defaults.calendar, year } },
	}
}

/** A workspace of `projects`, `open` open. */
function workspaceOf(projects: Project[], open: string | null): Workspace {
	return { projects: Object.fromEntries(projects.map((p) => [p.id, p])), open }
}

/** Every stored key and its text. */
function stored(): Record<string, string> {
	return Object.fromEntries(
		Array.from({ length: localStorage.length }, (_, i) => {
			const key = localStorage.key(i)!
			return [key, localStorage.getItem(key)!]
		}),
	)
}

/** Spies on every write to storage. */
function spyOnWrites() {
	return [vi.spyOn(localStorage, 'setItem'), vi.spyOn(localStorage, 'removeItem')]
}

beforeEach(() => {
	vi.stubGlobal('localStorage', memoryStorage())
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('saveWorkspace and loadWorkspace', () => {
	it('round-trip the workspace, one key per project and the open one in the workspace record', () => {
		const workspace = workspaceOf([monthly(1, 'Home'), monthly(2, 'Work')], id(2))
		saveWorkspace(defaultWorkspace(), workspace)
		expect(Object.keys(stored()).toSorted()).toEqual([
			`calendarium-project:${id(1)}`,
			`calendarium-project:${id(2)}`,
			'calendarium-workspace',
		])
		expect(localStorage.getItem(`calendarium-project:${id(2)}`)).toBe(
			serializeProject(workspace.projects[id(2)], { pretty: false }),
		)
		expect(JSON.parse(localStorage.getItem('calendarium-workspace')!)).toEqual({
			version: FORMAT_VERSION,
			app: APP_VERSION,
			open: id(2),
		})
		expect(loadWorkspace()).toEqual(workspace)
	})

	it('write only the projects that changed, and the record only when the open one changed', () => {
		const home = monthly(1, 'Home')
		const work = monthly(2, 'Work')
		const before = workspaceOf([home, work], id(1))
		saveWorkspace(defaultWorkspace(), before)

		const [setItem] = spyOnWrites()
		const renamed = { ...work, name: 'Office' }
		saveWorkspace(before, workspaceOf([home, renamed], id(1)))
		expect(setItem.mock.calls.map(([key]) => key)).toEqual([`calendarium-project:${id(2)}`])

		setItem.mockClear()
		saveWorkspace(workspaceOf([home, renamed], id(1)), workspaceOf([home, renamed], id(2)))
		expect(setItem.mock.calls.map(([key]) => key)).toEqual(['calendarium-workspace'])
		expect(loadWorkspace()).toEqual(workspaceOf([home, renamed], id(2)))
	})

	it('remove a deleted project’s key', () => {
		const before = workspaceOf([monthly(1, 'Home'), monthly(2, 'Work')], id(1))
		saveWorkspace(defaultWorkspace(), before)
		saveWorkspace(before, workspaceOf([monthly(1, 'Home')], id(1)))
		expect(localStorage.getItem(`calendarium-project:${id(2)}`)).toBeNull()
		expect(projectList(loadWorkspace()).map((p) => p.id)).toEqual([id(1)])
	})

	it('back up a record a later version wrote before overwriting it', () => {
		const [major, minor] = APP_VERSION.split('.').map(Number)
		const current = JSON.parse(serializeProject(monthly(1, 'Home'), { pretty: false }))
		const later = [
			{ ...current, version: FORMAT_VERSION + 1, future: 1 },
			{ ...current, version: FORMAT_VERSION + 1, layout: 'quarterly' },
			{ ...current, app: `${major}.${minor + 1}.0` },
		]
		for (const record of later) {
			const text = JSON.stringify(record)
			localStorage.setItem(`calendarium-project:${id(1)}`, text)
			const project = monthly(1, 'Home', 2040)
			saveWorkspace(defaultWorkspace(), workspaceOf([project], id(1)))
			expect(localStorage.getItem(`calendarium-project-backup:${id(1)}`)).toBe(text)
			expect(localStorage.getItem(`calendarium-project:${id(1)}`)).toBe(
				serializeProject(project, { pretty: false }),
			)
		}
	})

	it('do not back up a record of this version', () => {
		const workspace = workspaceOf([monthly(1, 'Home')], id(1))
		saveWorkspace(defaultWorkspace(), workspace)
		saveWorkspace(workspaceOf([], null), workspace)
		expect(localStorage.getItem(`calendarium-project-backup:${id(1)}`)).toBeNull()
	})
})

describe('saveWorkspace outcome', () => {
	const workspace = workspaceOf([monthly(1, 'Home')], id(1))

	/** Makes every storage write throw `error`. */
	function failWrites(error: Error) {
		vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
			throw error
		})
	}

	it('says the save was written', () => {
		expect(saveWorkspace(defaultWorkspace(), workspace)).toEqual({ saved: true })
	})

	it('says storage is full on a quota error', () => {
		failWrites(new DOMException('Full', 'QuotaExceededError'))
		expect(saveWorkspace(defaultWorkspace(), workspace)).toEqual({
			saved: false,
			reason: 'quota',
		})
	})

	it('says storage is unavailable on any other error', () => {
		failWrites(new DOMException('Blocked', 'SecurityError'))
		expect(saveWorkspace(defaultWorkspace(), workspace)).toEqual({
			saved: false,
			reason: 'unavailable',
		})
	})
})

describe('loadWorkspace', () => {
	it('gives an empty workspace without any data, and writes nothing', () => {
		const writes = spyOnWrites()
		expect(loadWorkspace()).toEqual(defaultWorkspace())
		for (const write of writes) expect(write).not.toHaveBeenCalled()
	})

	it('gives an empty workspace when storage is unavailable', () => {
		vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
			throw new Error('SecurityError')
		})
		expect(loadWorkspace()).toEqual(defaultWorkspace())
	})

	it('skips the records it can’t read, leaving them as they are, and other apps’ keys', () => {
		saveWorkspace(defaultWorkspace(), workspaceOf([monthly(1, 'Home')], id(1)))
		const others = {
			[`calendarium-project:${id(2)}`]: '{broken',
			[`calendarium-project:${id(3)}`]: JSON.stringify({
				format: 'calendarium/project',
				version: FORMAT_VERSION + 1,
				id: id(3),
				layout: 'quarterly',
				options: {},
			}),
			'calendarium-project:not-an-id': serializeProject(monthly(4, 'Lost'), {
				pretty: false,
			}),
			[`other-app-project:${id(5)}`]: serializeProject(monthly(5, 'Theirs'), {
				pretty: false,
			}),
			[`calendarium-project-backup:${id(6)}`]: serializeProject(monthly(6, 'Old'), {
				pretty: false,
			}),
		}
		for (const [key, text] of Object.entries(others)) localStorage.setItem(key, text)

		const writes = spyOnWrites()
		expect(projectList(loadWorkspace()).map((p) => p.name)).toEqual(['Home'])
		for (const write of writes) expect(write).not.toHaveBeenCalled()
		expect(stored()).toMatchObject(others)
	})

	it('takes a project’s id from its key, whatever the record says', () => {
		const text = serializeProject(monthly(9, 'Home'), { pretty: false })
		localStorage.setItem(`calendarium-project:${id(1)}`, text)
		localStorage.setItem(`calendarium-project:${id(2)}`, text.replace(`"${id(9)}"`, 'null'))
		expect(projectList(loadWorkspace()).map((p) => p.id)).toEqual([id(1), id(2)])
	})

	it('opens the first listed project when the record names none of them, or is missing', () => {
		saveWorkspace(defaultWorkspace(), workspaceOf([monthly(1, 'b'), monthly(2, 'a')], id(1)))
		for (const open of [id(9), null, 'toString']) {
			localStorage.setItem('calendarium-workspace', JSON.stringify({ version: 6, open }))
			expect(loadWorkspace().open).toBe(id(2))
		}
		localStorage.removeItem('calendarium-workspace')
		expect(loadWorkspace().open).toBe(id(2))
	})
})

describe('loadWorkspace of 5.x data', () => {
	const defaults = (layout: 'yearly' | 'monthly' | 'weekly' | 'daily') =>
		defaultLayoutOptions(layout)

	/** 5.x data showing `layout`, holding every layout's flat options, `changes` applied. */
	function legacyData(layout: string, changes: Record<string, object> = {}) {
		const untouched = { year: 2024, locale: defaults('yearly').calendar.locale }
		return {
			version: 5,
			app: '5.0.0',
			layout,
			layouts: {
				'year-per-page': { ...untouched, ...changes['year-per-page'] },
				'month-per-page': { ...untouched, ...changes['month-per-page'] },
				'week-per-page': { ...untouched, ...changes['week-per-page'] },
				'day-per-page': { ...untouched, ...changes['day-per-page'] },
			},
		}
	}

	it('makes a project of each changed layout, the year aside, and of the shown one, which opens', () => {
		const data = legacyData('week-per-page', {
			'month-per-page': { title: 'Office' },
			'day-per-page': { dayPageLines: 'ruled', year: 2030 },
		})
		localStorage.setItem('calendarium-config', JSON.stringify(data))
		const workspace = loadWorkspace()
		const projects = projectList(workspace)
		expect(projects.map((p) => p.layout).toSorted()).toEqual(['daily', 'monthly', 'weekly'])
		for (const project of projects) expect(project.name).toBe('')
		expect(openProject(workspace)?.layout).toBe('weekly')
		const byLayout = Object.fromEntries(projects.map((p) => [p.layout, p.options]))
		expect(byLayout.monthly).toMatchObject({ header: { title: 'Office' } })
		expect(byLayout.daily).toMatchObject({
			calendar: { year: 2030 },
			content: { fill: 'ruled' },
		})
		// Its stored year kept, untouched as it was.
		expect(byLayout.weekly).toMatchObject({ calendar: { year: 2024 } })
	})

	it('writes the projects and the workspace record, leaving the 5.x data as it is', () => {
		const text = JSON.stringify(
			legacyData('year-per-page', { 'day-per-page': { firstHour: 5 } }),
		)
		localStorage.setItem('calendarium-config', text)
		const workspace = loadWorkspace()
		expect(localStorage.getItem('calendarium-config')).toBe(text)
		expect(JSON.parse(localStorage.getItem('calendarium-workspace')!)).toMatchObject({
			open: workspace.open,
		})
		for (const project of Object.values(workspace.projects)) {
			expect(localStorage.getItem(`calendarium-project:${project.id}`)).toBe(
				serializeProject(project, { pretty: false }),
			)
		}
	})

	it('runs once: a second load gives the same projects and writes nothing', () => {
		localStorage.setItem(
			'calendarium-config',
			JSON.stringify(legacyData('day-per-page', { 'year-per-page': { title: 'Wall' } })),
		)
		const first = loadWorkspace()
		expect(Object.keys(first.projects)).toHaveLength(2)
		const writes = spyOnWrites()
		expect(loadWorkspace()).toEqual(first)
		for (const write of writes) expect(write).not.toHaveBeenCalled()
	})

	it('makes a project of the shown layout even when it stored no options', () => {
		localStorage.setItem(
			'calendarium-config',
			JSON.stringify({ version: 4, layout: 'month-per-page', layouts: {} }),
		)
		const workspace = loadWorkspace()
		expect(openProject(workspace)?.options).toEqual(defaults('monthly'))
		expect(projectList(workspace)).toHaveLength(1)
	})

	it('ignores data that is not 5.x data, writing nothing', () => {
		for (const text of [
			'{broken',
			JSON.stringify({ version: 2, layout: 'yearly', layouts: {} }),
			JSON.stringify({ version: 6, open: null, projects: [] }),
		]) {
			localStorage.setItem('calendarium-config', text)
			const writes = spyOnWrites()
			expect(loadWorkspace()).toEqual(defaultWorkspace())
			for (const write of writes) expect(write).not.toHaveBeenCalled()
			vi.restoreAllMocks()
		}
	})

	it('is not migrated once the workspace record exists', () => {
		localStorage.setItem('calendarium-config', JSON.stringify(legacyData('year-per-page')))
		localStorage.setItem('calendarium-workspace', JSON.stringify({ version: 6, open: null }))
		expect(loadWorkspace()).toEqual(defaultWorkspace())
	})
})
