import type { AppConfig } from './AppConfig'
import type { LayoutOptions, LayoutId } from '../layouts'
import { asObject } from '../core/validation'
import { FILE_FORMAT, isConfigFile, isFromLaterVersion, upgradeFile } from './migrations'
import { parseLayoutOptions, parseLayoutId } from './parseConfig'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** Pretty-printed JSON for a downloadable file holding one layout's options. */
export function serializeLayoutOptions<K extends LayoutId>(
	layout: K,
	options: LayoutOptions[K],
): string {
	const file = {
		format: FILE_FORMAT,
		version: CONFIG_VERSION,
		app: APP_VERSION,
		layout,
		...options,
	}
	return JSON.stringify(file, null, '\t') + '\n'
}

/** A file to download. */
export interface ExportedFile {
	fileName: string
	text: string
}

/** The active layout's options as a file named after it and its year: `calendar-day-per-page-2026.json`. */
export function exportLayoutFile(config: AppConfig): ExportedFile {
	const { layout } = config
	const options = config.layouts[layout]
	return {
		fileName: `calendar-${layout}-${options.year}.json`,
		text: serializeLayoutOptions(layout, options),
	}
}

/**
 * One layout's options read from a file, with the layout they belong to, the fields that were
 * invalid (see `ParsedLayoutOptions`), and whether a later version of the app wrote the file, so
 * settings it added are ignored.
 */
export type ImportedLayoutOptions = {
	[K in LayoutId]: { layout: K; options: LayoutOptions[K]; ignored: string[]; newer: boolean }
}[LayoutId]

function imported<K extends LayoutId>(layout: K, data: unknown, newer: boolean) {
	return { layout, ...parseLayoutOptions(layout, data), newer } as ImportedLayoutOptions
}

/**
 * Parses an imported config file; `null` when it is not one of this app's files (see
 * `isConfigFile`) or has no valid version. The options go to the layout the file names, or to
 * `fallbackLayout` when it names none.
 */
export function parseConfigFile(
	text: string,
	fallbackLayout: LayoutId,
): ImportedLayoutOptions | null {
	let data: unknown
	try {
		data = JSON.parse(text)
	} catch {
		return null
	}
	const raw = asObject(data)
	if (raw === null || !isConfigFile(raw)) return null
	const file = upgradeFile(raw)
	if (file === null) return null
	return imported(parseLayoutId(file) ?? fallbackLayout, file, isFromLaterVersion(raw))
}
