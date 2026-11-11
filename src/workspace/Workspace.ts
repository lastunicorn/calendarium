import type { Project, ProjectId } from './Project'

/**
 * The workspace: every project kept in this browser, and the one open. The aggregate root of the
 * settings: changed only by `workspaceReducer`'s commands, which keep every project's options
 * normalized, and loaded and saved by `storage.ts`, its repository.
 */
export interface Workspace {
	/** Every project kept in this browser, by id. */
	projects: Readonly<Record<ProjectId, Project>>
	/** The project the sidebar edits and the preview draws; `null` when there is none. */
	open: ProjectId | null
}

/** A workspace with no project. */
export function defaultWorkspace(): Workspace {
	return { projects: {}, open: null }
}

/** The project the sidebar edits and the preview draws; `null` when none is open. */
export function openProject({ projects, open }: Workspace): Project | null {
	return open !== null && Object.hasOwn(projects, open) ? projects[open] : null
}

/** The name a project is shown and sorted by: its name trimmed, `''` when it has none. */
function shownName(project: Project): string {
	return project.name.trim()
}

/**
 * Orders projects as the picker lists them: by name, the unnamed ones last, then by id so the
 * order is stable.
 */
function compareProjects(a: Project, b: Project): number {
	const nameA = shownName(a)
	const nameB = shownName(b)
	if ((nameA === '') !== (nameB === '')) return nameA === '' ? 1 : -1
	return nameA.localeCompare(nameB) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/** Every project, in the order the picker lists them (see `compareProjects`). */
export function projectList({ projects }: Workspace): Project[] {
	return Object.values(projects).sort(compareProjects)
}
