import { asObject, type UntrustedObject } from '../core/validation'
import { isLayoutId, layoutSpec } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { isFromLaterVersion, upgradeProject } from './migrations'
import { isProjectId, type Project, type ProjectId } from './Project'
import { APP_VERSION, FORMAT_VERSION } from './version'

// The serialized project: one JSON shape for a project file and a project in storage,
// `{ format, version, app, id, name, layout, options }`, the tags beside the options so no option
// can collide with one. A file is pretty-printed, a storage record compact.

/** Marks a JSON object as one of this app's serialized projects, from 6 on. */
export const PROJECT_FORMAT = 'calendarium/project'

/** `project` as its serialized object: the tags, then the project. */
export function projectDocument({ id, name, layout, options }: Project) {
	// The options keep the key order of their layout's defaults: sidebar order.
	return {
		format: PROJECT_FORMAT,
		version: FORMAT_VERSION,
		app: APP_VERSION,
		id,
		name,
		layout,
		options,
	}
}

/** `project` as JSON, pretty-printed with tabs (for a file) or compact (for storage). */
export function serializeProject(project: Project, { pretty }: { pretty: boolean }): string {
	const document = projectDocument(project)
	return pretty ? JSON.stringify(document, null, '\t') + '\n' : JSON.stringify(document)
}

/**
 * A project read from untrusted data, with its options' fields that were present but invalid, as
 * their paths (`content.schedule.firstHour`, `page.margins.top`), which kept their defaults, and
 * whether a later version of the app wrote it, so settings it added are ignored. Its id is `null`
 * when the data has none, or an invalid one. Or why it could not be read: it is not a project
 * (`notProject`), or names a layout this version doesn't have (`unknownLayout`, from a later one).
 */
export type ParsedProject =
	| { ok: true; project: Project<ProjectId | null>; ignored: string[]; newer: boolean }
	| { ok: false; reason: 'notProject' | 'unknownLayout' }

/**
 * A project's fields in the current shape (`id`, `name`, `layout`, `options`), still untrusted,
 * as a serialized project or a converted legacy file holds them, read field by field: an invalid
 * id is `null`, a name that is not a string `''`, the options are read by their layout's
 * `parseOptions`, falling back to its defaults; options that are not an object are `ignored`
 * whole, as `options`. `newer` is passed on as is.
 */
export function parseProjectFields(fields: UntrustedObject, newer: boolean): ParsedProject {
	const { layout } = fields
	if (!isLayoutId(layout)) return { ok: false, reason: 'unknownLayout' }
	const ignored: string[] = []
	if (fields.options !== undefined && asObject(fields.options) === null) ignored.push('options')
	const project = {
		id: isProjectId(fields.id) ? fields.id : null,
		name: typeof fields.name === 'string' ? fields.name : '',
		layout,
		options: parseOptions(layoutSpec(layout), fields.options, ignored),
	} as Project<ProjectId | null>
	return { ok: true, project, ignored, newer }
}

/**
 * Reads untrusted data as a serialized project of any version from 6 on, brought to the current
 * shape (`PROJECT_MIGRATIONS`). Data without `PROJECT_FORMAT`, or with it but no version from 6
 * on, is not a project; one from a later version is read as the current shape, as far as it
 * matches.
 */
export function parseProjectDocument(data: unknown): ParsedProject {
	const raw = asObject(data)
	if (raw === null || raw.format !== PROJECT_FORMAT) return { ok: false, reason: 'notProject' }
	const upgraded = upgradeProject(raw)
	if (upgraded === null) return { ok: false, reason: 'notProject' }
	return parseProjectFields(upgraded, isFromLaterVersion(raw))
}
