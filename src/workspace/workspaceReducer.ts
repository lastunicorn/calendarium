import { applyPatch, type Patch } from '../core/data'
import {
	defaultLayoutOptions,
	normalizeLayout,
	type LayoutId,
	type LayoutOptions,
} from '../layouts'
import type { Project, ProjectId } from './Project'
import { openProject, projectList, type Workspace } from './Workspace'

/**
 * The commands that change the `Workspace` aggregate, the only way it changes. Ids are given by
 * the caller, so the reducer stays pure. The commands on the open project act on nothing when
 * none is open.
 */
export type WorkspaceAction =
	/** Adds a project of `layout` with its defaults, and opens it. */
	| { type: 'createProject'; id: ProjectId; name: string; layout: LayoutId }
	/** Opens another project; an unknown id changes nothing. */
	| { type: 'openProject'; id: ProjectId }
	/** Renames the open project. */
	| { type: 'renameProject'; name: string }
	/**
	 * Changes some of the open project's options, nested objects field by field, keeping the rest;
	 * ignored when `layout` isn't the open project's, which the patch's type is paired with.
	 */
	| {
			[K in LayoutId]: { type: 'updateOptions'; layout: K; patch: Patch<LayoutOptions[K]> }
	  }[LayoutId]
	/** Puts the open project's options back to its layout's defaults, keeping its id and name. */
	| { type: 'resetOptions' }
	/**
	 * Removes a project; if it was open, opens its neighbor in `projectList` (the next one, or the
	 * previous when it was the last), or none. An unknown id changes nothing.
	 */
	| { type: 'deleteProject'; id: ProjectId }
	/** Adds a project (an opened file), or replaces the one with its id, and opens it. */
	| { type: 'importProject'; project: Project }

/** `project` with its layout's rules applied to its options; the same object when it follows them. */
function normalizeProject(project: Project): Project {
	const options = normalizeLayout(project.layout, project.options)
	// `options` has `project.layout`'s type, which TypeScript can't follow through the union.
	return options === project.options ? project : ({ ...project, options } as Project)
}

/** `workspace` with `project` added or replaced, after applying its layout's rules. */
function withProject(workspace: Workspace, project: Project): Workspace {
	return {
		...workspace,
		projects: { ...workspace.projects, [project.id]: normalizeProject(project) },
	}
}

/** The project opened once `id` is deleted from `workspace`, where it is open. */
function neighborOf(workspace: Workspace, id: ProjectId): ProjectId | null {
	const list = projectList(workspace)
	const index = list.findIndex((project) => project.id === id)
	return (list[index + 1] ?? list[index - 1] ?? null)?.id ?? null
}

/** `workspace` after `action`, each changed project's options passed through its layout's `normalize`. */
export function workspaceReducer(workspace: Workspace, action: WorkspaceAction): Workspace {
	switch (action.type) {
		case 'createProject': {
			if (Object.hasOwn(workspace.projects, action.id)) return workspace
			const { id, name, layout } = action
			const project = { id, name, layout, options: defaultLayoutOptions(layout) } as Project
			return { ...withProject(workspace, project), open: id }
		}
		case 'openProject':
			return action.id === workspace.open || !Object.hasOwn(workspace.projects, action.id)
				? workspace
				: { ...workspace, open: action.id }
		case 'renameProject': {
			const project = openProject(workspace)
			if (project === null || project.name === action.name) return workspace
			return withProject(workspace, { ...project, name: action.name })
		}
		case 'updateOptions': {
			const project = openProject(workspace)
			if (project === null || project.layout !== action.layout) return workspace
			// The layouts match, so the patch fits the options, which TypeScript can't follow.
			const options = applyPatch(
				project.options,
				action.patch as Patch<typeof project.options>,
			)
			return options === project.options
				? workspace
				: withProject(workspace, { ...project, options } as Project)
		}
		case 'resetOptions': {
			const project = openProject(workspace)
			if (project === null) return workspace
			const options = defaultLayoutOptions(project.layout)
			return withProject(workspace, { ...project, options } as Project)
		}
		case 'deleteProject': {
			const { id } = action
			if (!Object.hasOwn(workspace.projects, id)) return workspace
			const { [id]: _, ...projects } = workspace.projects
			const open = workspace.open === id ? neighborOf(workspace, id) : workspace.open
			return { projects, open }
		}
		case 'importProject':
			return { ...withProject(workspace, action.project), open: action.project.id }
	}
}
