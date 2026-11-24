import { useEffect, useReducer, useRef, useState } from 'react'

import type { Patch } from '../core/data'
import type { LayoutId, LayoutOptions } from '../layouts'
import type { Ports } from '../ports'
import { newProjectId, type Project, type ProjectId } from '../workspace/Project'
import { loadWorkspace, saveWorkspace, type SaveFailure } from '../workspace/storage'
import { workspaceReducer, type WorkspaceAction } from '../workspace/workspaceReducer'
import { usePorts } from './ports'

/** Changes some of one layout's options, nested objects field by field. */
export type UpdateLayoutOptions = <K extends LayoutId>(
	layout: K,
	patch: Patch<LayoutOptions[K]>,
) => void

/** The workspace kept in this browser, in the environment now, migrated projects taking ids from `ids`. */
function initialWorkspace({ environment, ids }: Ports) {
	return loadWorkspace(environment.current(), ids)
}

/**
 * The app's single workspace state: loaded from and saved to `localStorage`, with why the last
 * save wasn't written, `null` when it was. New projects' ids, from the ports, and the environment
 * the defaults are taken in, are made here, so the reducer stays pure.
 */
export function useWorkspace() {
	const ports = usePorts()
	const { environment, ids } = ports
	const [workspace, dispatch] = useReducer(workspaceReducer, ports, initialWorkspace)
	// Saved after each change, as what changed since the last save written: the projects loaded
	// are already stored, and a failed save's changes are written again with the next change.
	const saved = useRef(workspace)
	const [saveFailure, setSaveFailure] = useState<SaveFailure | null>(null)

	useEffect(() => {
		if (workspace === saved.current) return
		const outcome = saveWorkspace(saved.current, workspace)
		if (outcome.saved) saved.current = workspace
		setSaveFailure(outcome.saved ? null : outcome.reason)
	}, [workspace])

	/**
	 * Adds a project with its layout's defaults, and opens it unless `open` is false while another
	 * one is open; gives its id.
	 */
	function createProject(name: string, layout: LayoutId, open = true): ProjectId {
		const id = newProjectId(ids)
		dispatch({ type: 'createProject', id, name, layout, env: environment.current(), open })
		return id
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
		dispatch({ type: 'resetOptions', env: environment.current() })
	}

	function deleteProject(id: ProjectId) {
		dispatch({ type: 'deleteProject', id })
	}

	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	function importProject(project: Project<ProjectId | null>) {
		const id = project.id ?? newProjectId(ids)
		dispatch({ type: 'importProject', project: { ...project, id } })
	}

	return {
		workspace,
		saveFailure,
		createProject,
		openProject,
		renameProject,
		updateOptions,
		resetOptions,
		deleteProject,
		importProject,
	}
}
