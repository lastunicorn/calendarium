import { type Workspace, defaultWorkspace } from './Workspace'
import { isLayoutId, type LayoutOptions, type LayoutId, layoutSpec, mapLayouts } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { type StoredData, upgradeStorage } from './migrations'
import { asObject } from '../core/validation'
import { APP_VERSION, FORMAT_VERSION } from './version'

/** The workspace as written to storage: tagged with its format version and the app version. */
export function toStoredWorkspace(workspace: Workspace) {
	return { version: FORMAT_VERSION, app: APP_VERSION, ...workspace }
}

/**
 * Keeps only the valid fields of one layout's options, falling back to that layout's defaults,
 * then applies the layout's cross-field rules. Invalid fields are added to `ignored`.
 */
function parseCurrentLayoutOptions<K extends LayoutId>(
	layout: K,
	data: unknown,
	ignored: string[] = [],
): LayoutOptions[K] {
	return parseOptions(layoutSpec(layout), data, ignored)
}

/** One layout's options parsed from untrusted data, with the fields that were dropped. */
export interface ParsedLayoutOptions<K extends LayoutId> {
	options: LayoutOptions[K]
	/**
	 * Fields that were present but invalid, and kept their defaults: `firstHour`,
	 * `page.margins.top`. Fields the layout doesn't have are left out silently.
	 */
	ignored: string[]
}

/**
 * Keeps only the valid fields of untrusted flat data in the current file shape (an imported
 * file, after `upgradeFile`) for one layout.
 */
export function parseLayoutOptions<K extends LayoutId>(
	layout: K,
	data: unknown,
): ParsedLayoutOptions<K> {
	const ignored: string[] = []
	const options = parseCurrentLayoutOptions(layout, data, ignored)
	return { options, ignored }
}

/** The layout named by flat data in the current file shape; `null` when it names none. */
export function parseLayoutId(data: StoredData): LayoutId | null {
	return isLayoutId(data.layout) ? data.layout : null
}

/**
 * Keeps only valid fields from untrusted stored data of any version, falling back to defaults.
 * Data from a later version is read as the current shape, as far as it matches; data without a
 * valid version is not read at all.
 */
export function parseWorkspace(data: unknown): Workspace {
	const workspace = defaultWorkspace()
	const raw = asObject(data)
	const stored = raw === null ? null : upgradeStorage(raw)
	if (stored === null) return workspace

	if (isLayoutId(stored.layout)) workspace.layout = stored.layout
	const layouts = asObject(stored.layouts) ?? {}
	workspace.layouts = mapLayouts((layout) => parseCurrentLayoutOptions(layout, layouts[layout]))
	return workspace
}
