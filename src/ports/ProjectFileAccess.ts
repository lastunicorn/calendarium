/** A file the user chose, as the page's file input gives it (a `File` is one). */
export interface ChosenFile {
	readonly name: string
	readonly size: number
	text(): Promise<string>
}

/** A chosen file's text, or why it was left unread. */
export type ReadFile = { ok: true; name: string; text: string } | { ok: false; reason: 'tooLarge' }

/**
 * Project files, as far as the browser lets the app reach the user's disk: one the user chose to
 * open, and one saved for them. What a file holds is the domain's (`workspace/projectFile.ts`).
 */
export interface ProjectFileAccess {
	/** Reads a chosen project file as text, unless it is over `maxBytes`, then left unread. */
	read: (file: ChosenFile, maxBytes: number) => Promise<ReadFile>
	/** Saves a serialized project as a JSON file named `fileName`, through the browser's download. */
	save: (fileName: string, text: string) => void
}

async function readChosenFile(file: ChosenFile, maxBytes: number): Promise<ReadFile> {
	if (file.size > maxBytes) return { ok: false, reason: 'tooLarge' }
	return { ok: true, name: file.name, text: await file.text() }
}

function downloadFile(fileName: string, text: string) {
	const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
	const link = document.createElement('a')
	link.href = url
	link.download = fileName
	link.click()
	// Revoking synchronously can cancel the download before it starts in some browsers.
	setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** The browser's: the file its file input gave, and its download. */
export const BROWSER_PROJECT_FILES: ProjectFileAccess = {
	read: readChosenFile,
	save: downloadFile,
}
