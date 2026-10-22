import {
	defaultLayoutOptions,
	LAYOUT_IDS,
	type LayoutOptions,
	type LayoutId,
	mapLayouts,
} from '../layouts'

/**
 * The workspace: which layout is shown, and a remembered set of options per layout.
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
