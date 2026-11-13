import { asObject } from '../core/validation'
import {
	defaultLayoutOptions,
	hasDefaultOptions,
	LAYOUT_IDS,
	layoutSpec,
	type AnyLayoutOptions,
	type LayoutId,
} from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { legacyWorkspace } from './legacy'
import { isFromLaterVersion } from './migrations'
import { isProjectId, newProjectId, type Project, type ProjectId } from './Project'
import { parseProjectDocument, serializeProject } from './projectDocument'
import { APP_VERSION, FORMAT_VERSION } from './version'
import { defaultWorkspace, projectList, type Workspace } from './Workspace'

// The `Workspace` repository. Each project is one key, so two tabs editing different projects
// don't overwrite each other:
//
// - `calendarium-workspace`: `{ version, app, open }`, the open project's id, and the marker that
//   the 5.x data was migrated;
// - `calendarium-project:<id>`: one serialized project (`serializeProject`, compact);
// - `calendarium-project-backup:<id>`: that project as a later version wrote it, kept before this
//   one overwrites it;
// - `calendarium-config` (and `calendarium-config-backup`): the data of 3 to 5, read once, then
//   left as they are, so a rollback to 5 still finds it.
//
// The prefixes matter: the GitHub Pages origin is shared with the user's other project pages.

const WORKSPACE_KEY = 'calendarium-workspace'
const PROJECT_KEY_PREFIX = 'calendarium-project:'
const PROJECT_BACKUP_KEY_PREFIX = 'calendarium-project-backup:'
const LEGACY_KEY = 'calendarium-config'

function projectKey(id: ProjectId): string {
	return PROJECT_KEY_PREFIX + id
}

/** The JSON stored under `key`; `null` when there is none, or it isn't JSON. */
function storedJson(key: string): unknown {
	const raw = localStorage.getItem(key)
	if (raw === null) return null
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

/** A workspace of `projects`, opening `open` when it is one of them, else the first listed. */
function workspaceOf(projects: readonly Project[], open: unknown): Workspace {
	const workspace: Workspace = {
		projects: Object.fromEntries(projects.map((project) => [project.id, project])),
		open: null,
	}
	const known = isProjectId(open) && Object.hasOwn(workspace.projects, open)
	return { ...workspace, open: known ? open : (projectList(workspace)[0]?.id ?? null) }
}

/**
 * Every project stored under a project key, by the key's id, whatever the one inside says. Those
 * it can't read (broken JSON, a later version's layout) are skipped and left as they are.
 */
function storedProjects(): Project[] {
	const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
	const projects: Project[] = []
	for (const key of keys) {
		if (key === null || !key.startsWith(PROJECT_KEY_PREFIX)) continue
		const id = key.slice(PROJECT_KEY_PREFIX.length)
		if (!isProjectId(id)) continue
		const parsed = parseProjectDocument(storedJson(key))
		if (parsed.ok) projects.push({ ...parsed.project, id } as Project)
	}
	return projects
}

/** Writes `project` under its key, backing up a record a later version wrote there first. */
function writeProject(project: Project): void {
	const key = projectKey(project.id)
	const stored = localStorage.getItem(key)
	const previous = asObject(storedJson(key))
	if (stored !== null && previous !== null && isFromLaterVersion(previous)) {
		localStorage.setItem(PROJECT_BACKUP_KEY_PREFIX + project.id, stored)
	}
	localStorage.setItem(key, serializeProject(project, { pretty: false }))
}

function writeWorkspaceRecord(open: ProjectId | null): void {
	const record = { version: FORMAT_VERSION, app: APP_VERSION, open }
	localStorage.setItem(WORKSPACE_KEY, JSON.stringify(record))
}

/**
 * Whether `options` are `layout`'s defaults, its year aside: 5 stored all four layouts, each with
 * the year it was first saved in, which says nothing about whether it was used.
 */
function hasDefaultsBesidesYear(layout: LayoutId, options: AnyLayoutOptions): boolean {
	const { year } = defaultLayoutOptions(layout).calendar
	return hasDefaultOptions(layout, { ...options, calendar: { ...options.calendar, year } })
}

/**
 * The workspace the data of 3 to 5 (`calendarium-config`) becomes: an unnamed project of each
 * layout whose options differ from its defaults, the year aside, and always of the layout that
 * was shown, which opens; `null` when there is no such data. Written at once, the projects first
 * and the workspace record, the marker that the migration ran, last, so the ids stay the same
 * from one load to the next and a second load (as React's StrictMode does in development) loads
 * them instead of migrating again. `calendarium-config` is left as it is.
 */
function migrateLegacy(): Workspace | null {
	const data = asObject(storedJson(LEGACY_KEY))
	const legacy = data === null ? null : legacyWorkspace(data)
	if (legacy === null) return null

	const projects: Project[] = []
	let open: ProjectId | null = null
	for (const layout of LAYOUT_IDS) {
		const shown = layout === legacy.shown
		if (!shown && !Object.hasOwn(legacy.layouts, layout)) continue
		const options = parseOptions(layoutSpec(layout), legacy.layouts[layout])
		if (!shown && hasDefaultsBesidesYear(layout, options)) continue
		const project = { id: newProjectId(), name: '', layout, options } as Project
		projects.push(project)
		if (shown) open = project.id
	}
	const workspace = workspaceOf(projects, open)
	try {
		for (const project of projects) writeProject(project)
		writeWorkspaceRecord(workspace.open)
	} catch {
		// Storage may be full; the migrated projects still open, and migrate again next time.
	}
	return workspace
}

/**
 * Loads the workspace: every stored project, and the open one from the workspace record, else the
 * first listed. The first time, when there is no workspace record, the data of 3 to 5 is migrated
 * (`migrateLegacy`), the one load that writes. Falls back to an empty workspace when storage is
 * unavailable.
 */
export function loadWorkspace(): Workspace {
	try {
		if (localStorage.getItem(WORKSPACE_KEY) === null) {
			const migrated = migrateLegacy()
			if (migrated !== null) return migrated
		}
		const record = asObject(storedJson(WORKSPACE_KEY))
		return workspaceOf(storedProjects(), record?.open)
	} catch {
		return defaultWorkspace()
	}
}

/**
 * Whether a save was written: `quota` when storage is full, `unavailable` when it refuses to be
 * written at all (blocked, private mode, a security policy).
 */
export type SaveOutcome = { saved: true } | { saved: false; reason: SaveFailure }

/** Why a save wasn't written. */
export type SaveFailure = 'quota' | 'unavailable'

/** Whether `error`, thrown by a storage write, says storage is full (Firefox once named it apart). */
function isQuotaError(error: unknown): boolean {
	return (
		error instanceof DOMException &&
		(error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
	)
}

/**
 * Saves what changed from `previous` to `next`: removes the keys of deleted projects, writes each
 * project whose object is not the previous one (a record a later version wrote backed up first,
 * since this version would drop what it doesn't know), and the workspace record when the open
 * project changed. Unchanged projects are never written, so nothing a later version stored is
 * lost by loading it. A failed save may have written part of it; saving the same change again
 * writes the rest, since each write is whole.
 */
export function saveWorkspace(previous: Workspace, next: Workspace): SaveOutcome {
	try {
		for (const id of Object.keys(previous.projects)) {
			if (!Object.hasOwn(next.projects, id)) localStorage.removeItem(projectKey(id))
		}
		for (const project of Object.values(next.projects)) {
			if (previous.projects[project.id] !== project) writeProject(project)
		}
		if (previous.open !== next.open) writeWorkspaceRecord(next.open)
		return { saved: true }
	} catch (error) {
		// The app still works without storage, but the user must be told the changes aren't kept.
		return { saved: false, reason: isQuotaError(error) ? 'quota' : 'unavailable' }
	}
}
