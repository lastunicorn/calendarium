import { useEffect, useReducer, useRef } from 'react'
import type { Patch } from '../core/data'
import { LAYOUT_IDS, type LayoutOptions, type LayoutId } from '../layouts'
import { newProjectId, type Project, type ProjectId } from '../workspace/Project'
import { openProject, projectList, type Workspace } from '../workspace/Workspace'
import { type WorkspaceAction, workspaceReducer } from '../workspace/workspaceReducer'
import { loadWorkspace, saveWorkspace } from '../workspace/storage'

/** Changes some of one layout's options, nested objects field by field. */
export type UpdateLayoutOptions = <K extends LayoutId>(
	layout: K,
	patch: Patch<LayoutOptions[K]>,
) => void

/**
 * The stored workspace, with a project of the first layout opened when none is: the sidebar has
 * no way to create one yet.
 */
function initialWorkspace(): Workspace {
	const workspace = loadWorkspace()
	if (openProject(workspace) !== null) return workspace
	const layout = LAYOUT_IDS[0]
	return workspaceReducer(workspace, {
		type: 'createProject',
		id: newProjectId(),
		name: '',
		layout,
	})
}

/** The app's single workspace state: loaded from and saved to `localStorage`. */
export function useWorkspace() {
	const [workspace, dispatch] = useReducer(workspaceReducer, undefined, initialWorkspace)
	// Saved only after a change, not on mount: the loaded workspace is already stored, and writing
	// it back would drop the fields a newer version stored that this one doesn't know.
	const saved = useRef(workspace)

	useEffect(() => {
		if (workspace === saved.current) return
		saved.current = workspace
		saveWorkspace(workspace)
	}, [workspace])

	/** Opens the first project of `layout`, or a new one when there is none, as the layout picker did. */
	function selectLayout(layout: LayoutId) {
		const project = projectList(workspace).find((candidate) => candidate.layout === layout)
		if (project !== undefined) dispatch({ type: 'openProject', id: project.id })
		else dispatch({ type: 'createProject', id: newProjectId(), name: '', layout })
	}

	// The cast pairs `layout` with its patch, which TypeScript can't follow through a generic.
	const update: UpdateLayoutOptions = (layout, patch) => {
		dispatch({ type: 'updateOptions', layout, patch } as WorkspaceAction)
	}

	/** Puts the open project's options back to its layout's defaults. */
	function resetOptions() {
		dispatch({ type: 'resetOptions' })
	}

	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	function importProject(project: Project<ProjectId | null>) {
		const id = project.id ?? newProjectId()
		dispatch({ type: 'importProject', project: { ...project, id } as Project })
	}

	return { workspace, selectLayout, update, resetOptions, importProject }
}
