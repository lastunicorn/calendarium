import { describe, expect, it } from 'vitest'
import { defaultLayoutOptions } from '../layouts'
import { isProjectId, type Project } from './Project'
import { projectDocument } from './projectDocument'
import { defaultWorkspace, openProject, projectList, type Workspace } from './Workspace'
import { parseWorkspace, toStoredWorkspace } from './parseWorkspace'
import { FORMAT_VERSION } from './version'

// Each project is read by `parseProjectDocument`, whose rules are tested with it; these check how
// the workspace holds them.

/** The `n`th test id, a valid project id that sorts by `n`. */
function id(n: number): string {
	return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

const HOME: Project = {
	id: id(1),
	name: 'Home',
	layout: 'yearly',
	options: defaultLayoutOptions('yearly'),
}
const WORK: Project = {
	id: id(2),
	name: 'Work',
	layout: 'weekly',
	options: {
		...defaultLayoutOptions('weekly'),
		header: { ...defaultLayoutOptions('weekly').header, showWeek: false },
	},
}

/** Stored data of the current version holding `projects`, `open` open. */
function stored(projects: unknown[], open: unknown) {
	return { version: FORMAT_VERSION, projects, open }
}

describe('parseWorkspace', () => {
	it('round-trips through toStoredWorkspace', () => {
		const workspace: Workspace = {
			projects: { [HOME.id]: HOME, [WORK.id]: WORK },
			open: WORK.id,
		}
		expect(parseWorkspace(toStoredWorkspace(workspace))).toEqual(workspace)
	})

	it('gives an empty workspace for missing or malformed data', () => {
		for (const data of [
			null,
			'nope',
			[],
			{ version: FORMAT_VERSION },
			stored('x' as never, null),
		]) {
			expect(parseWorkspace(data)).toEqual(defaultWorkspace())
		}
	})

	it('ignores data without a version this app knows', () => {
		for (const version of [undefined, 1, 2, '6', 6.5]) {
			const data = { ...stored([projectDocument(HOME)], HOME.id), version }
			expect(parseWorkspace(data)).toEqual(defaultWorkspace())
		}
	})

	it('opens the first listed project when the open id names none', () => {
		const projects = [projectDocument(WORK), projectDocument(HOME)]
		for (const open of [undefined, null, id(9), 'toString']) {
			expect(parseWorkspace(stored(projects, open)).open).toBe(HOME.id)
		}
	})

	it('drops the projects it can’t read, and gives one without an id a new id', () => {
		const workspace = parseWorkspace(
			stored(
				[
					projectDocument(HOME),
					{ ...projectDocument(WORK), layout: 'quarterly' },
					{ ...projectDocument(WORK), format: 'other' },
					'broken',
					{ ...projectDocument(WORK), id: undefined },
				],
				HOME.id,
			),
		)
		const [home, work] = projectList(workspace)
		expect(projectList(workspace)).toHaveLength(2)
		expect(home).toEqual(HOME)
		expect(isProjectId(work.id)).toBe(true)
		expect(work).toEqual({ ...WORK, id: work.id })
	})

	it('reads data from a later version as the current shape', () => {
		const future = { ...projectDocument(HOME), version: FORMAT_VERSION + 1, futureField: 1 }
		const workspace = parseWorkspace({
			...stored([future], HOME.id),
			version: FORMAT_VERSION + 1,
		})
		expect(workspace).toEqual({ projects: { [HOME.id]: HOME }, open: HOME.id })
	})
})

describe('parseWorkspace of legacy data', () => {
	it('makes an unnamed project of each stored layout, the shown one open', () => {
		const workspace = parseWorkspace({
			version: 3,
			layout: 'week-per-page',
			layouts: {
				'year-per-page': { title: 'Ours' },
				'week-per-page': { highlightWeekends: 'off', showWeekNumbers: false },
				'quarter-per-page': {},
			},
		})
		const projects = projectList(workspace)
		expect(projects.map((project) => [project.layout, project.name])).toEqual([
			['yearly', ''],
			['weekly', ''],
		])
		for (const project of projects) expect(isProjectId(project.id)).toBe(true)
		expect(openProject(workspace)?.layout).toBe('weekly')
		expect(openProject(workspace)?.options).toMatchObject({
			header: { showWeek: false },
			content: { highlightWeekendDays: false },
		})
		expect(projects[0].options).toMatchObject({ header: { title: 'Ours' } })
	})

	it('opens the first listed project when the shown layout is not stored', () => {
		const workspace = parseWorkspace({
			version: 5,
			layout: 'quarter-per-page',
			layouts: { 'month-per-page': {}, 'day-per-page': {} },
		})
		expect(openProject(workspace)).toBe(projectList(workspace)[0])
	})

	it('falls back to the defaults for one broken layout only', () => {
		const workspace = parseWorkspace({
			version: 5,
			layouts: { 'year-per-page': 'broken', 'day-per-page': { year: 2040 } },
		})
		const byLayout = (layout: string) =>
			projectList(workspace).find((project) => project.layout === layout)
		const yearly = byLayout('yearly')!
		const daily = byLayout('daily')!
		expect(yearly.options).toEqual(defaultLayoutOptions('yearly'))
		expect(daily.layout === 'daily' && daily.options.calendar.year).toBe(2040)
	})
})
