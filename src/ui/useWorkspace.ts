import { useEffect, useReducer, useRef } from 'react'
import type { LayoutOptions, LayoutId } from '../layouts'
import type { Project } from '../workspace/Workspace'
import { type WorkspaceAction, workspaceReducer } from '../workspace/workspaceReducer'
import { loadWorkspace, saveWorkspace } from '../workspace/storage'

/** Changes some of one layout's options. */
export type UpdateLayoutOptions = <K extends LayoutId>(
	layout: K,
	patch: Partial<LayoutOptions[K]>,
) => void

/** The app's single workspace state: loaded from and saved to `localStorage`. */
export function useWorkspace() {
	const [workspace, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspace)
	// Saved only after a change, not on mount: the loaded workspace is already stored, and writing
	// it back would drop the fields a newer version stored that this one doesn't know.
	const saved = useRef(workspace)

	useEffect(() => {
		if (workspace === saved.current) return
		saved.current = workspace
		saveWorkspace(workspace)
	}, [workspace])

	function selectLayout(layout: LayoutId) {
		dispatch({ type: 'selectLayout', layout })
	}

	// The casts pair `layout` with its options, which TypeScript can't follow through a generic.
	const update: UpdateLayoutOptions = (layout, patch) => {
		dispatch({ type: 'update', layout, patch } as WorkspaceAction)
	}

	function newProject(layout: LayoutId) {
		dispatch({ type: 'newProject', layout })
	}

	// Takes only the project from an opened file, not its notices; the cast keeps the pair together.
	function openProject({ layout, options }: Project) {
		dispatch({ type: 'openProject', project: { layout, options } as Project })
	}

	return { workspace, selectLayout, update, newProject, openProject }
}
