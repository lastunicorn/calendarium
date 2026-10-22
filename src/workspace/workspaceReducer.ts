import type { Project, Workspace } from './Workspace'
import {
	defaultLayoutOptions,
	type LayoutOptions,
	type LayoutId,
	normalizeLayout,
} from '../layouts'

/**
 * The commands that change the `Workspace` aggregate, the only way it changes. The per-layout ones
 * have one variant per layout, so a patch or the options have that layout's type.
 */
export type WorkspaceAction =
	/** Shows another layout; every layout's options stay as they were. */
	| { type: 'selectLayout'; layout: LayoutId }
	/** Changes some of one layout's options, keeping the rest. */
	| { [K in LayoutId]: { type: 'update'; layout: K; patch: Partial<LayoutOptions[K]> } }[LayoutId]
	/** Starts `layout` over from its default options; the active layout stays as it was. */
	| { type: 'newProject'; layout: LayoutId }
	/** Swaps in a project for the last one of its layout and shows that layout (an opened file). */
	| { type: 'openProject'; project: Project }

/** `workspace` with `layout`'s options replaced, after applying that layout's rules. */
function withLayout<K extends LayoutId>(
	workspace: Workspace,
	layout: K,
	options: LayoutOptions[K],
): Workspace {
	return {
		...workspace,
		layouts: { ...workspace.layouts, [layout]: normalizeLayout(layout, options) },
	}
}

/** `workspace` after `action`, each changed layout's options passed through its `normalize`. */
export function workspaceReducer(workspace: Workspace, action: WorkspaceAction): Workspace {
	switch (action.type) {
		case 'selectLayout':
			return { ...workspace, layout: action.layout }
		case 'update':
			return withLayout(workspace, action.layout, {
				...workspace.layouts[action.layout],
				...action.patch,
			})
		case 'newProject':
			return withLayout(workspace, action.layout, defaultLayoutOptions(action.layout))
		case 'openProject': {
			const { layout, options } = action.project
			return { ...withLayout(workspace, layout, options), layout }
		}
	}
}
