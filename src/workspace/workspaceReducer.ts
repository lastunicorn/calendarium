import type { Workspace } from './Workspace'
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
	/** Restores one layout's default options; the active layout stays as it was. */
	| { type: 'resetLayout'; layout: LayoutId }
	/** Swaps in one layout's options and shows that layout (an imported file). */
	| { [K in LayoutId]: { type: 'importLayout'; layout: K; options: LayoutOptions[K] } }[LayoutId]

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
		case 'resetLayout':
			return withLayout(workspace, action.layout, defaultLayoutOptions(action.layout))
		case 'importLayout':
			return {
				...withLayout(workspace, action.layout, action.options),
				layout: action.layout,
			}
	}
}
