import { defaultWorkspace, projectList, type Workspace } from './Workspace'
import { LAYOUT_IDS, layoutSpec } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { FIRST_PROJECT_VERSION, versionOf } from './migrations'
import { legacyWorkspace } from './legacy'
import { isProjectId, newProjectId, type Project, type ProjectId } from './Project'
import { parseProjectDocument, projectDocument } from './projectDocument'
import { asObject, type UntrustedObject } from '../core/validation'
import { APP_VERSION, FORMAT_VERSION } from './version'

// Until the repository keeps one key per project, the workspace is stored whole under one key:
// `{ version, app, open, projects: [<serialized project>, …] }`.

/** The workspace as written to storage: tagged with its format version and the app version. */
export function toStoredWorkspace({ projects, open }: Workspace) {
	return {
		version: FORMAT_VERSION,
		app: APP_VERSION,
		open,
		projects: Object.values(projects).map(projectDocument),
	}
}

/** A workspace of `projects`, opening `open` when it is one of them, else the first listed. */
function workspaceOf(projects: Project[], open: unknown): Workspace {
	const workspace: Workspace = {
		projects: Object.fromEntries(projects.map((project) => [project.id, project])),
		open: null,
	}
	const opened = isProjectId(open) && Object.hasOwn(workspace.projects, open)
	return { ...workspace, open: opened ? open : (projectList(workspace)[0]?.id ?? null) }
}

/**
 * Legacy storage (3 to 5) as projects: one for each stored layout, unnamed, each given a new id,
 * the layout that was shown open.
 */
function legacyProjects(raw: UntrustedObject): Workspace {
	const legacy = legacyWorkspace(raw)
	if (legacy === null) return defaultWorkspace()
	let open: ProjectId | null = null
	const projects = LAYOUT_IDS.filter((layout) => Object.hasOwn(legacy.layouts, layout)).map(
		(layout) => {
			const options = parseOptions(layoutSpec(layout), legacy.layouts[layout])
			const project = { id: newProjectId(), name: '', layout, options } as Project
			if (layout === legacy.shown) open = project.id
			return project
		},
	)
	return workspaceOf(projects, open)
}

/**
 * Keeps only valid fields from untrusted stored data of any version, falling back to an empty
 * workspace. Data from before 6 is read through `legacyWorkspace`; data from 6 on, a later
 * version's included, as the current shape, as far as it matches, each project read by
 * `parseProjectDocument` (a project without an id is given one, one it can't read is dropped);
 * data without a valid version is not read at all.
 */
export function parseWorkspace(data: unknown): Workspace {
	const raw = asObject(data)
	const version = raw === null ? null : versionOf(raw)
	if (raw === null || version === null) return defaultWorkspace()
	if (version < FIRST_PROJECT_VERSION) return legacyProjects(raw)

	const projects: Project[] = []
	for (const item of Array.isArray(raw.projects) ? raw.projects : []) {
		const parsed = parseProjectDocument(item)
		if (!parsed.ok) continue
		const { project } = parsed
		projects.push({ ...project, id: project.id ?? newProjectId() } as Project)
	}
	return workspaceOf(projects, raw.open)
}
