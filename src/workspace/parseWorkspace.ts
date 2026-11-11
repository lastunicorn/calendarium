import { type Workspace, defaultWorkspace } from './Workspace'
import { isLayoutId, layoutSpec, mapLayouts } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { FIRST_PROJECT_VERSION, versionOf } from './migrations'
import { legacyWorkspace } from './legacy'
import { asObject } from '../core/validation'
import { APP_VERSION, FORMAT_VERSION } from './version'

/** The workspace as written to storage: tagged with its format version and the app version. */
export function toStoredWorkspace(workspace: Workspace) {
	return { version: FORMAT_VERSION, app: APP_VERSION, ...workspace }
}

/**
 * Keeps only valid fields from untrusted stored data of any version, falling back to defaults.
 * Data from before 6 is read through `legacyWorkspace`; data from 6 on, a later version's
 * included, as the current shape, as far as it matches; data without a valid version is not read
 * at all.
 */
export function parseWorkspace(data: unknown): Workspace {
	const workspace = defaultWorkspace()
	const raw = asObject(data)
	const version = raw === null ? null : versionOf(raw)
	if (raw === null || version === null) return workspace

	const stored =
		version < FIRST_PROJECT_VERSION
			? legacyWorkspace(raw)
			: { shown: isLayoutId(raw.layout) ? raw.layout : null, layouts: asObject(raw.layouts) }
	if (stored === null) return workspace
	if (stored.shown !== null) workspace.layout = stored.shown
	const layouts = stored.layouts ?? {}
	workspace.layouts = mapLayouts((layout) => parseOptions(layoutSpec(layout), layouts[layout]))
	return workspace
}
