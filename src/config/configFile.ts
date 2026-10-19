import type { LayoutConfigs, LayoutId } from './CalendarConfig'
import { asObject, FILE_FORMAT, isConfigFile, isFromLaterVersion, upgradeFile } from './migrations'
import { parseLayoutConfig, parseLayoutId } from './parseConfig'
import { APP_VERSION, CONFIG_VERSION } from './version'

/** Pretty-printed JSON for a downloadable file holding one layout's options. */
export function serializeLayoutConfig<K extends LayoutId>(
	layout: K,
	config: LayoutConfigs[K],
): string {
	const file = {
		format: FILE_FORMAT,
		version: CONFIG_VERSION,
		app: APP_VERSION,
		layout,
		...config,
	}
	return JSON.stringify(file, null, '\t') + '\n'
}

/**
 * One layout's options read from a file, with the layout they belong to, the fields that were
 * invalid (see `ParsedLayoutConfig`), and whether a later version of the app wrote the file, so
 * settings it added are ignored.
 */
export type ImportedLayoutConfig = {
	[K in LayoutId]: { layout: K; config: LayoutConfigs[K]; ignored: string[]; newer: boolean }
}[LayoutId]

function imported<K extends LayoutId>(layout: K, data: unknown, newer: boolean) {
	return { layout, ...parseLayoutConfig(layout, data), newer } as ImportedLayoutConfig
}

/**
 * Parses an imported config file; `null` when it is not one of this app's files (see
 * `isConfigFile`) or has no valid version. The options go to the layout the file names, or to
 * `fallbackLayout` when it names none.
 */
export function parseConfigFile(
	text: string,
	fallbackLayout: LayoutId,
): ImportedLayoutConfig | null {
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
