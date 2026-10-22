import {
	defaultLayoutOptions,
	hasDefaultOptions,
	LAYOUT_IDS,
	type LayoutOptions,
	type LayoutId,
	mapLayouts,
} from '../layouts'

/**
 * One calendar being made: a layout and its options, as a project file holds them and the preview
 * draws them. One variant per layout, so the options have that layout's type.
 */
export type Project = { [K in LayoutId]: { layout: K; options: LayoutOptions[K] } }[LayoutId]

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

/** The project the workspace shows: the active layout with its options. */
export function activeProject({ layout, layouts }: Workspace): Project {
	// `layouts[layout]` is that layout's options, which TypeScript can't follow through the union.
	return { layout, options: layouts[layout] } as Project
}

/** Whether the shown project still has its layout's defaults, so starting a new one changes nothing. */
export function isNewProject({ layout, layouts }: Workspace): boolean {
	return hasDefaultOptions(layout, layouts[layout])
}
