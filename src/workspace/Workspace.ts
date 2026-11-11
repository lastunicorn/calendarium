import {
	defaultLayoutOptions,
	hasDefaultOptions,
	LAYOUT_IDS,
	type LayoutOptions,
	type LayoutId,
	mapLayouts,
} from '../layouts'
import type { Project } from './Project'

/**
 * The workspace: which layout is shown, and the last project of each layout, as its options.
 * The aggregate root of the settings: changed only by `workspaceReducer`'s commands, which keep every
 * layout's options normalized, and loaded and saved by `storage.ts`, its repository.
 */
export interface Workspace {
	/** The active layout, whose options the sidebar edits and the preview shows. */
	layout: LayoutId
	layouts: LayoutOptions
}

/** Every layout's defaults, showing the first layout. */
export function defaultWorkspace(): Workspace {
	return { layout: LAYOUT_IDS[0], layouts: mapLayouts(defaultLayoutOptions) }
}

/**
 * The project the workspace shows: the active layout with its options, unnamed. The workspace
 * keeps no project ids, so it has none.
 */
export function activeProject({ layout, layouts }: Workspace): Project<null> {
	// `layouts[layout]` is that layout's options, which TypeScript can't follow through the union.
	return { id: null, name: '', layout, options: layouts[layout] } as Project<null>
}

/** Whether the shown project still has its layout's defaults, so starting a new one changes nothing. */
export function isNewProject({ layout, layouts }: Workspace): boolean {
	return hasDefaultOptions(layout, layouts[layout])
}
