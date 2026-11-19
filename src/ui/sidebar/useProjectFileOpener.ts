import { useState } from 'react'

import type { Project, ProjectId } from '../../workspace/Project'
import { readProjectFile } from '../../workspace/projectFile'
import type { Workspace } from '../../workspace/Workspace'
import { describeOpened, describeRejected, type OpenedFile } from './projectFileNotices'

/** A file waiting for the user to say whether it overwrites the project with its id. */
interface PendingOverwrite {
	fileName: string
	opened: OpenedFile
	/** The project it would overwrite. */
	existing: Project
}

/** The opening of project files, and what the user is told or asked about the last one. */
export interface ProjectFileOpener {
	/** Why the last file chosen couldn't be opened; empty when it could. */
	error: string
	/** What there is to tell about the last file opened; empty when nothing. */
	notice: string
	/** The project the file chosen would overwrite, until the user says whether it does; `null` when none. */
	overwriting: Project | null
	/** Reads a project file and adds its project, asking first if it would overwrite one. */
	open: (file: File) => Promise<void>
	/** Overwrites the project with the waiting file's. */
	confirmOverwrite: () => void
	/** Keeps the project the waiting file would have overwritten. */
	cancelOverwrite: () => void
	/** Forgets the last file's error or notice, once the user moves on. */
	dismiss: () => void
}

/**
 * Opens project files into `projects`, through `onImport`: a file that isn't a project is an
 * error, one of a project already kept waits until the user says whether it overwrites it, and
 * one made by a newer version, or with invalid fields, is opened with a notice.
 */
export function useProjectFileOpener(
	projects: Workspace['projects'],
	onImport: (project: Project<ProjectId | null>) => void,
): ProjectFileOpener {
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')
	const [pendingOverwrite, setPendingOverwrite] = useState<PendingOverwrite | null>(null)

	/** Adds or overwrites the project a file holds, and tells what there is to tell about it. */
	function importOpened(fileName: string, opened: OpenedFile) {
		setNotice(describeOpened(fileName, opened))
		onImport(opened.project)
	}

	async function open(file: File) {
		const opened = await readProjectFile(file)
		setError('')
		setNotice('')
		if (!opened.ok) {
			setError(describeRejected(file.name, opened))
			return
		}
		const { id } = opened.project
		if (id !== null && Object.hasOwn(projects, id)) {
			setPendingOverwrite({ fileName: file.name, opened, existing: projects[id] })
			return
		}
		importOpened(file.name, opened)
	}

	function confirmOverwrite() {
		if (pendingOverwrite === null) return
		setPendingOverwrite(null)
		importOpened(pendingOverwrite.fileName, pendingOverwrite.opened)
	}

	function cancelOverwrite() {
		setPendingOverwrite(null)
	}

	function dismiss() {
		setError('')
		setNotice('')
	}

	return {
		error,
		notice,
		overwriting: pendingOverwrite?.existing ?? null,
		open,
		confirmOverwrite,
		cancelOverwrite,
		dismiss,
	}
}
