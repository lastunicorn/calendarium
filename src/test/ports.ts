import type { Environment } from '../core/environment'
import type { Ports } from '../ports'
import type { EnvironmentAccess } from '../ports/EnvironmentAccess'
import type { IdAccess } from '../ports/IdAccess'
import type { PrinterAccess } from '../ports/PrinterAccess'
import { BROWSER_PROJECT_FILES, type ProjectFileAccess } from '../ports/ProjectFileAccess'
import { TEST_ENV } from './environment'

/** An environment that stays `env`, `TEST_ENV` unless given. */
export function fixedEnvironment(env: Environment = TEST_ENV): EnvironmentAccess {
	return { current: () => env }
}

/**
 * Ids counting up from 1, each a lowercase v4 UUID (`00000000-0000-4000-8000-000000000001`, …), so
 * a test can name the ones it will be given.
 */
export function sequentialIds(): IdAccess {
	let made = 0
	return {
		newId: () => {
			made += 1
			return `00000000-0000-4000-8000-${String(made).padStart(12, '0')}`
		},
	}
}

/** A project file saved, as it would have been downloaded. */
export interface SavedFile {
	fileName: string
	text: string
}

/**
 * Project files that keep what they are asked to save, in place of the download, and read a chosen
 * file as the browser does, which reaches nothing but the file given.
 */
export interface RecordingProjectFiles extends ProjectFileAccess {
	readonly saved: readonly SavedFile[]
}

function recordingProjectFiles(): RecordingProjectFiles {
	const saved: SavedFile[] = []
	return {
		read: BROWSER_PROJECT_FILES.read,
		save: (fileName, text) => {
			saved.push({ fileName, text })
		},
		saved,
	}
}

/** A printer that counts what it is asked to print, in place of the print dialog. */
export interface CountingPrinter extends PrinterAccess {
	readonly prints: number
}

function countingPrinter(): CountingPrinter {
	let prints = 0
	return {
		print: () => {
			prints += 1
		},
		get prints() {
			return prints
		},
	}
}

/** The ports a test runs on: each records what it is asked, and reaches nothing outside the test. */
export interface TestPorts extends Ports {
	environment: EnvironmentAccess
	ids: IdAccess
	projectFiles: RecordingProjectFiles
	printer: CountingPrinter
}

/** Fresh test ports, for a test to give the app (`PortsContext`) and read back. */
export function testPorts(): TestPorts {
	return {
		environment: fixedEnvironment(),
		ids: sequentialIds(),
		projectFiles: recordingProjectFiles(),
		printer: countingPrinter(),
	}
}
