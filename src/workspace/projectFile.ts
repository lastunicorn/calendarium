import { asObject } from '../core/validation'
import { LEGACY_FILE_FORMAT, legacyFile } from './legacy'
import type { Project } from './Project'
import {
	parseProjectDocument,
	parseProjectFields,
	serializeProject,
	type ParsedProject,
} from './projectDocument'

/** A project file to download. */
export interface ProjectFile {
	fileName: string
	text: string
}

/** Characters a file name can't hold on some file system, and whitespace, each run becoming `-`. */
const UNSAFE_IN_FILE_NAMES = /[\s\\/:*?"<>|]+/g

/**
 * The file name a project is saved under: its name, in lowercase, with whitespace and the
 * characters file systems refuse as `-` (`work-2027.json`), letters of any script kept; or, when
 * it has none, its layout and year (`calendar-daily-2026.json`).
 */
function projectFileName({ name, layout, options }: Project): string {
	const base = name
		.trim()
		.toLowerCase()
		.replace(UNSAFE_IN_FILE_NAMES, '-')
		.replace(/^-+|-+$/g, '')
	return base === '' ? `calendar-${layout}-${options.calendar.year}.json` : `${base}.json`
}

/** `project` as a file to download, pretty-printed and named after it. */
export function projectFile(project: Project): ProjectFile {
	return {
		fileName: projectFileName(project),
		text: serializeProject(project, { pretty: true }),
	}
}

/**
 * A project read from an opened file (see `ParsedProject`): its id is `null` when the file has
 * none, as a legacy one never has. A file over `MAX_PROJECT_FILE_SIZE` is refused unread.
 */
export type OpenedProjectFile = ParsedProject | { ok: false; reason: 'tooLarge' }

/**
 * The largest file read as a project, in bytes: 1 MB. A project file takes a few kilobytes, and
 * parsing a far larger one would freeze the tab.
 */
export const MAX_PROJECT_FILE_SIZE = 1024 * 1024

/**
 * The name the file names of 5 were generated as, `calendar-<layout>-<year>`, with the layout's
 * old or current id, maybe followed by the copy number a browser adds (`calendar-weekly-2026 (1)`).
 */
const GENERATED_FILE_NAME = /^calendar-[a-z]+(?:-[a-z]+)*-\d+(?: \(\d+\))?$/

/**
 * The name a legacy file's project takes from the file's name: the name without `.json`, unless
 * it is one the app generated, which names no project.
 */
function nameFromFileName(fileName: string): string {
	const name = fileName.replace(/\.json$/i, '')
	return GENERATED_FILE_NAME.test(name) ? '' : name
}

/**
 * Reads an opened project file: a serialized project (`PROJECT_FORMAT`, from 6 on), or a legacy
 * file (`LEGACY_FILE_FORMAT`, from 3 to 5), whose project is named after `fileName`. Anything
 * else, including text that is not a JSON object, is not a project.
 */
export function parseProjectFile(text: string, fileName: string): OpenedProjectFile {
	let data: unknown
	try {
		data = JSON.parse(text)
	} catch {
		return { ok: false, reason: 'notProject' }
	}
	const raw = asObject(data)
	if (raw?.format !== LEGACY_FILE_FORMAT) return parseProjectDocument(data)
	const fields = legacyFile(raw)
	if (fields === null) return { ok: false, reason: 'notProject' }
	return parseProjectFields({ ...fields, name: nameFromFileName(fileName) }, false)
}

/** Reads an opened file as a project (`parseProjectFile`), unless it is too large to be one. */
export async function readProjectFile(file: File): Promise<OpenedProjectFile> {
	if (file.size > MAX_PROJECT_FILE_SIZE) return { ok: false, reason: 'tooLarge' }
	return parseProjectFile(await file.text(), file.name)
}
