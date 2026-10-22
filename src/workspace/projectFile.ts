import type { Project } from './Workspace'
import type { LayoutId } from '../layouts'
import { asObject } from '../core/validation'
import { FILE_FORMAT, isProjectFile, isFromLaterVersion, upgradeFile } from './migrations'
import { parseLayoutOptions, parseLayoutId } from './parseWorkspace'
import { APP_VERSION, FORMAT_VERSION } from './version'

/** Pretty-printed JSON for a downloadable project file: the layout and its options, flat. */
export function serializeProject({ layout, options }: Project): string {
	const file = {
		format: FILE_FORMAT,
		version: FORMAT_VERSION,
		app: APP_VERSION,
		layout,
		...options,
	}
	return JSON.stringify(file, null, '\t') + '\n'
}

/** A project file to download. */
export interface ProjectFile {
	fileName: string
	text: string
}

/** `project` as a file named after its layout and year: `calendar-day-per-page-2026.json`. */
export function projectFile(project: Project): ProjectFile {
	return {
		fileName: `calendar-${project.layout}-${project.options.year}.json`,
		text: serializeProject(project),
	}
}

/**
 * A project read from a file, with the fields that were invalid (see `ParsedLayoutOptions`), and
 * whether a later version of the app wrote the file, so settings it added are ignored.
 */
export type OpenedProject = Project & { ignored: string[]; newer: boolean }

function opened<K extends LayoutId>(layout: K, data: unknown, newer: boolean) {
	return { layout, ...parseLayoutOptions(layout, data), newer } as OpenedProject
}

/**
 * Parses an opened project file; `null` when it is not one of this app's files (see
 * `isProjectFile`) or has no valid version. The options go to the layout the file names, or to
 * `fallbackLayout` when it names none.
 */
export function parseProjectFile(text: string, fallbackLayout: LayoutId): OpenedProject | null {
	let data: unknown
	try {
		data = JSON.parse(text)
	} catch {
		return null
	}
	const raw = asObject(data)
	if (raw === null || !isProjectFile(raw)) return null
	const file = upgradeFile(raw)
	if (file === null) return null
	return opened(parseLayoutId(file) ?? fallbackLayout, file, isFromLaterVersion(raw))
}
