import type { OpenedProjectFile } from '../../workspace/projectFile'
import type { SaveFailure } from '../../workspace/storage'

/** A project file that was read. */
export type OpenedFile = Extract<OpenedProjectFile, { ok: true }>

/** A file that could not be read as a project. */
export type RejectedFile = Extract<OpenedProjectFile, { ok: false }>

/**
 * What to tell the user about an opened project file made by a newer version, or with invalid fields;
 * empty when there is nothing to report.
 */
export function describeOpened(fileName: string, { ignored, newer }: OpenedFile): string {
	const notices = []
	if (newer) {
		notices.push(`Opened ${fileName}, made by a newer version; some settings may be ignored.`)
	}
	if (ignored.length > 0) {
		const settings = ignored.length === 1 ? '1 setting was' : `${ignored.length} settings were`
		const fields = ignored.join(', ')
		notices.push(
			newer
				? `${settings} invalid and kept the default: ${fields}.`
				: `Opened ${fileName}; ${settings} invalid and kept the default: ${fields}.`,
		)
	}
	return notices.join(' ')
}

/** Why a file could not be opened, for the user. */
export function describeRejected(fileName: string, { reason }: RejectedFile): string {
	switch (reason) {
		case 'notProject':
			return `${fileName} is not a calendar project file.`
		case 'unknownLayout':
			return `${fileName} was made by a newer version, with a layout this one doesn’t have.`
		case 'tooLarge':
			return `${fileName} is too large to be a calendar project file (over 1 MB).`
	}
}

/** Why the changes aren't kept, for the user, and how to keep them anyway. */
export function describeSaveFailure(failure: SaveFailure): string {
	const why =
		failure === 'quota'
			? 'this browser’s storage is full'
			: 'this browser’s storage is unavailable'
	return `Changes aren’t being saved: ${why}. Save the project to a file to keep it.`
}
