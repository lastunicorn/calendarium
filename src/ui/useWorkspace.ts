import { useEffect, useReducer, useRef } from 'react'
import type { Patch } from '../core/data'
import type { LayoutOptions, LayoutId } from '../layouts'
import { newProjectId, type Project, type ProjectId } from '../workspace/Project'
import { type WorkspaceAction, workspaceReducer } from '../workspace/workspaceReducer'
import { loadWorkspace, saveWorkspace } from '../workspace/storage'

/** Changes some of one layout's options, nested objects field by field. */
export type UpdateLayoutOptions = <K extends LayoutId>(
	layout: K,
	patch: Patch<LayoutOptions[K]>,
) => void

/**
 * The app's single workspace state: loaded from and saved to `localStorage`. New projects' ids
 * are made here, so the reducer stays pure.
 */
export function useWorkspace() {
	const [workspace, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspace)
	// Saved after each change, as what changed since the last save: the projects loaded are
	// already stored.
	const saved = useRef(workspace)

	useEffect(() => {
		if (workspace === saved.current) return
		saveWorkspace(saved.current, workspace)
		saved.current = workspace
	}, [workspace])

	/** Adds a project with its layout's defaults, and opens it. */
	function createProject(name: string, layout: LayoutId) {
		dispatch({ type: 'createProject', id: newProjectId(), name, layout })
	}

	function openProject(id: ProjectId) {
		dispatch({ type: 'openProject', id })
	}

	function renameProject(name: string) {
		dispatch({ type: 'renameProject', name })
	}

	// The cast pairs `layout` with its patch, which TypeScript can't follow through a generic.
	const updateOptions: UpdateLayoutOptions = (layout, patch) => {
		dispatch({ type: 'updateOptions', layout, patch } as WorkspaceAction)
	}

	/** Puts the open project's options back to its layout's defaults. */
	function resetOptions() {
		dispatch({ type: 'resetOptions' })
	}

	function deleteProject(id: ProjectId) {
		dispatch({ type: 'deleteProject', id })
	}

	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	function importProject(project: Project<ProjectId | null>) {
		const id = project.id ?? newProjectId()
		dispatch({ type: 'importProject', project: { ...project, id } as Project })
	}

	return {
		workspace,
		createProject,
		openProject,
		renameProject,
		updateOptions,
		resetOptions,
		deleteProject,
		importProject,
	}
}
